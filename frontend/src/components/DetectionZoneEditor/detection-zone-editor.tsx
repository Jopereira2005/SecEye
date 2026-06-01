import React, { useState, useRef, useEffect } from 'react';
import { View, Image, PanResponder, Animated, StyleSheet, LayoutChangeEvent, Text } from 'react-native';
import { Svg, Polygon, Line, Circle } from 'react-native-svg';
import { CustomColors, CustomFonts, Spacing } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';
import { MjpegPlayer } from '../MjpegPlayer/mjpeg-player';

interface Point {
  x: number;
  y: number;
}

interface DetectionZoneEditorProps {
  imageSource?: any;
  videoUrl?: string;
  initialPoints?: Point[]; // Normalized [0..100]
  onChange?: (points: Point[]) => void;
  readOnly?: boolean;
}

export function DetectionZoneEditor({ imageSource, videoUrl, initialPoints, onChange, readOnly }: DetectionZoneEditorProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  
  // Pontos em porcentagem (0 a 100)
  const defaultPoints = [
    { x: 0, y: 0 }, // TL
    { x: 100, y: 0 }, // TR
    { x: 100, y: 100 }, // BR
    { x: 0, y: 100 }  // BL
  ];

  const [points, setPoints] = useState<Point[]>(
    initialPoints && initialPoints.length > 0 ? initialPoints : defaultPoints
  );

  const layoutRef = useRef(layout);
  const pointsRef = useRef(points);

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  // Executa uma única vez para avisar o pai sobre os pontos iniciais
  useEffect(() => {
    pointsRef.current = points;
    if (onChange) {
      onChange(points);
    }
  }, []);

  // Sincroniza pontos se eles vierem de fora e mudarem (útil para ReadOnly atualizar ao voltar do Modal)
  useEffect(() => {
    if (initialPoints && initialPoints.length > 0) {
      setPoints(initialPoints);
      pointsRef.current = initialPoints;
    }
  }, [initialPoints]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setLayout({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  const updatePoint = (index: number, dx: number, dy: number, startPoint: Point) => {
    const currentLayout = layoutRef.current;
    if (currentLayout.width === 0 || currentLayout.height === 0) return;
    
    const prev = pointsRef.current;
    const newPoints = [...prev];
    
    // Calcula nova posição em porcentagem
    let newX = startPoint.x + (dx / currentLayout.width) * 100;
    let newY = startPoint.y + (dy / currentLayout.height) * 100;

    // Limita aos limites da imagem (0 a 100)
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    newPoints[index] = { x: newX, y: newY };
    
    // Atualiza ref, state interno, e avisa o pai
    pointsRef.current = newPoints;
    setPoints(newPoints);
    if (onChange) {
      onChange(newPoints);
    }
  };

  const createPanResponder = (index: number) => {
    let startPoint = { x: 0, y: 0 };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Guarda a posição inicial lendo da referência atualizada
        startPoint = { ...pointsRef.current[index] };
      },
      onPanResponderMove: (_, gestureState) => {
        updatePoint(index, gestureState.dx, gestureState.dy, startPoint);
      },
      onPanResponderRelease: () => {},
    });
  };

  // Cria 4 pan responders fixos (um para cada canto)
  const panResponders = useRef([
    createPanResponder(0),
    createPanResponder(1),
    createPanResponder(2),
    createPanResponder(3),
  ]).current;

  // Converter porcentagem para pixels na hora de desenhar
  const getPixelPoints = () => {
    return points.map(p => ({
      x: (p.x / 100) * layout.width,
      y: (p.y / 100) * layout.height
    }));
  };

  const pxPoints = getPixelPoints();
  const polygonPointsString = pxPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.container}>
      {!readOnly && (
        <Text style={styles.instruction}>Arraste os pontos para definir a área de interesse (ROI).</Text>
      )}
      
      <View style={styles.imageContainer} onLayout={handleLayout}>
        {videoUrl ? (
          <MjpegPlayer
            url={videoUrl}
            style={styles.image}
            resizeMode="stretch"
          />
        ) : (
          <Image 
            source={imageSource} 
            style={styles.image} 
            resizeMode="stretch"
          />
        )}

        {layout.width > 0 && layout.height > 0 && (
          <View style={StyleSheet.absoluteFill}>
            {/* Container que isola e aplica o border-radius e clipping EXCLUSIVAMENTE pro SVG (filtro verde) */}
            <View style={[StyleSheet.absoluteFill, { borderRadius: 12, overflow: 'hidden' }]}>
              <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                {/* O polígono fechado */}
                <Polygon
                  points={polygonPointsString}
                  fill="rgba(0, 255, 128, 0.2)"
                  stroke={CustomColors.success}
                  strokeWidth="2"
                />
              </Svg>
            </View>

            {/* Os 4 pontos arrastáveis (Círculos) - Fora do recorte para não sumirem nas bordas */}
            {!readOnly && pxPoints.map((p, index) => (
              <View
                key={index}
                style={[
                  styles.draggablePoint,
                  {
                    left: p.x - 15, // 15 = metade da largura do drag area
                    top: p.y - 15,
                  }
                ]}
                {...panResponders[index].panHandlers}
              >
                <View style={styles.pointDot} />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  instruction: {
    fontFamily: CustomFonts.inter,
    color: CustomColors.grayScale,
    fontSize: moderateScale(12),
    marginBottom: Spacing.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9, // Formato padrão de câmera
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: CustomColors.dark,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  draggablePoint: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(255,0,0,0.3)', // Debug
  },
  pointDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: CustomColors.light,
    borderWidth: 3,
    borderColor: CustomColors.success,
  }
});

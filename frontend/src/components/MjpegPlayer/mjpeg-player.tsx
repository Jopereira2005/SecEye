import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface MjpegPlayerProps {
  url: string;
  style?: StyleProp<ViewStyle>;
  resizeMode?: 'contain' | 'cover' | 'stretch';
}

export function MjpegPlayer({ url, style, resizeMode = 'cover' }: MjpegPlayerProps) {
  // Gera um HTML embutido que carrega a imagem MJPEG ocupando 100% da tela, sem scroll
  const objectFit = resizeMode === 'stretch' ? 'fill' : resizeMode;
  
  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: ${objectFit};
          }
        </style>
      </head>
      <body>
        <img src="${url}" />
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: htmlContent, baseUrl: url }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        containerStyle={styles.webviewContainer}
        // Evita flash branco no carregamento
        backgroundColor="transparent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});

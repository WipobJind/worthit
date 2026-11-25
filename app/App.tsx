// barcode scan test screen (week 1)

import { useRef, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { BarcodeScanningResult, BarcodeType, CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { hasValidCheckDigit } from './src/barcode';

const PRODUCT_BARCODE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e'];

type Scan = {
  id: number;
  data: string;
  type: string;
  time: string;
  checkDigitOk: boolean | null; // null for UPC-E
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ScanTestScreen />
    </SafeAreaProvider>
  );
}

function ScanTestScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scans, setScans] = useState<Scan[]>([]);
  const [paused, setPaused] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  // the camera can fire a few times for one barcode, this stops duplicates
  const locked = useRef(false);

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.message}>WorthIt needs the camera to scan product barcodes.</Text>
        {permission.canAskAgain ? (
          <Button label="Allow camera" onPress={requestPermission} />
        ) : (
          <Button label="Open settings" onPress={() => Linking.openSettings()} />
        )}
      </SafeAreaView>
    );
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (locked.current) return;
    locked.current = true;
    setPaused(true);

    const isUpcE = result.type.toLowerCase().replace(/[^a-z]/g, '').includes('upce');
    const scan: Scan = {
      id: Date.now(),
      data: result.data,
      type: result.type,
      time: new Date().toLocaleTimeString(),
      checkDigitOk: isUpcE ? null : hasValidCheckDigit(result.data),
    };
    setScans((previous) => [scan, ...previous]);
  }

  function scanNext() {
    locked.current = false;
    setPaused(false);
  }

  const latest = scans[0];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.cameraBox}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{ barcodeTypes: PRODUCT_BARCODE_TYPES }}
          onBarcodeScanned={paused ? undefined : handleBarcodeScanned}
        />
        <View style={styles.aimFrame} pointerEvents="none" />
        <Text style={styles.hint}>{paused ? 'Paused' : 'Point at the barcode'}</Text>
      </View>

      <View style={styles.panel}>
        {latest ? (
          <View>
            <Text selectable style={styles.code}>{latest.data}</Text>
            <Text style={styles.detail}>
              Type: {latest.type}   Check digit: {checkDigitLabel(latest.checkDigitOk)}
            </Text>
          </View>
        ) : (
          <Text style={styles.detail}>No barcode scanned yet.</Text>
        )}

        <View style={styles.buttonRow}>
          <Button label={paused ? 'Scan next' : 'Scanning...'} onPress={scanNext} disabled={!paused} />
          <Button label={torchOn ? 'Light off' : 'Light on'} onPress={() => setTorchOn(!torchOn)} />
        </View>

        <Text style={styles.listTitle}>This session: {scans.length} scans</Text>
        <FlatList
          data={scans}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Text selectable style={styles.listItem}>
              {item.time}   {item.data}   ({item.type}, check {checkDigitLabel(item.checkDigitOk)})
            </Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function checkDigitLabel(ok: boolean | null): string {
  if (ok === null) return 'n/a';
  return ok ? 'OK' : 'WRONG';
}

function Button(props: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      style={[styles.button, props.disabled && styles.buttonDisabled]}
    >
      <Text style={styles.buttonText}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#111',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  cameraBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  aimFrame: {
    width: '80%',
    height: 140,
    borderWidth: 3,
    borderColor: '#4ade80',
    borderRadius: 12,
  },
  hint: {
    position: 'absolute',
    bottom: 12,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  panel: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    gap: 10,
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  detail: {
    fontSize: 14,
    color: '#444',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  listTitle: {
    fontWeight: '600',
    marginTop: 4,
  },
  listItem: {
    fontSize: 13,
    color: '#333',
    paddingVertical: 3,
  },
});

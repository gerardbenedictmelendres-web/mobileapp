import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

export function BrandMonogram({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.brandMark, compact && styles.brandMarkCompact]}>
      <View style={styles.brandLetterPair}>
        <Text style={[styles.brandMarkText, compact && styles.brandMarkTextCompact, styles.uLetter]}>U</Text>
        <Text style={[styles.brandMarkText, compact && styles.brandMarkTextCompact, styles.lLetter]}>L</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandMark: { alignItems: 'center', backgroundColor: colors.burgundy, borderColor: 'rgba(255, 255, 255, 0.55)', borderRadius: 18, borderWidth: 1, elevation: 8, height: 62, justifyContent: 'center', shadowColor: colors.burgundy, shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.2, shadowRadius: 12, width: 62 },
  brandMarkCompact: { borderRadius: 15, height: 44, width: 44 },
  brandLetterPair: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginLeft: 2 },
  brandMarkText: { color: colors.white, fontWeight: '900', includeFontPadding: false, lineHeight: 28 },
  brandMarkTextCompact: { lineHeight: 22 },
  uLetter: { fontSize: 28, letterSpacing: -2.5, marginRight: -2 },
  lLetter: { fontSize: 25, letterSpacing: -1.5 },
});
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export const color = {
  ink: '#141f1a',
  body: '#43584d',
  green: '#096449',
  dark: '#054d3b',
  pale: '#e7f2eb',
  line: '#d9e5dd',
  bg: '#f4f8f5',
  white: '#fff',
};

export function Button({ title, onPress, active = true, compact = false, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        active ? styles.primary : styles.secondary,
        { opacity: disabled ? 0.5 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.buttonLabel, { color: active ? color.white : color.dark }]}>
        {title}
      </Text>
    </Pressable>
  );
}
export function Card({ title, children, tinted = false }) {
  return (
    <View style={[styles.card, tinted && styles.tint]}>
      {title && <Text style={styles.h2}>{title}</Text>}
      {children}
    </View>
  );
}
export function Field({ label, value, onChange, trailing, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBox}>
        <TextInput
          accessibilityLabel={label}
          value={value ?? ''}
          onChangeText={onChange}
          style={styles.input}
          placeholderTextColor="#597366"
          {...props}
        />
        {trailing}
      </View>
    </View>
  );
}
export function Body({ children }) {
  return <Text style={styles.body}>{children}</Text>;
}
export function Heading({ kicker, title, description }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text accessibilityRole="header" style={styles.h1}>
        {title}
      </Text>
      {description && <Text style={styles.headingDescription}>{description}</Text>}
    </View>
  );
}
export function Banner({ value, label, side }) {
  return (
    <View style={styles.banner}>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerValue}>{value}</Text>
        <Text style={styles.bannerLabel}>{label}</Text>
      </View>
      {side && <Text style={styles.bannerIcon}>{side}</Text>}
    </View>
  );
}
export function Choice({ title, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipActive]}
    >
      <Text style={[styles.chipLabel, selected && { color: color.dark }]}>{title}</Text>
    </Pressable>
  );
}
export function Pain({ label, value, onChange }) {
  const n = Number(value);
  return (
    <Card>
      <View style={styles.between}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.reading}>{n} / 10</Text>
      </View>
      <View style={styles.gauge}>
        {Array.from({ length: 11 }, (_, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={label + ' ' + i}
            accessibilityState={{ selected: n === i }}
            onPress={() => onChange(String(i))}
            style={styles.gaugeCell}
          >
            <View
              style={[
                styles.segment,
                i <= n && styles.segmentActive,
                n === i && styles.segmentSelected,
              ]}
            />
            <Text style={[styles.tick, n === i && styles.tickSelected]}>{i}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.between}>
        <Text style={styles.meta}>Sem dor</Text>
        <Text style={styles.meta}>Dor intensa</Text>
      </View>
    </Card>
  );
}
export function Tabs({ items, page, onSelect }) {
  return (
    <View style={styles.dock}>
      <View style={styles.dockInner}>
        {items.map(([name, label, icon]) => (
          <Pressable
            key={name}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: page === name }}
            onPress={() => onSelect(name)}
            style={[styles.tab, page === name && styles.selectedTab]}
          >
            <Text style={[styles.tabIcon, page === name && styles.tabActive]}>{icon}</Text>
            <Text style={[styles.tabText, page === name && styles.tabActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  scroll: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingBottom: 28,
    gap: 16,
  },
  header: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { fontSize: 18, fontWeight: '800', letterSpacing: -0.45, color: color.ink },
  brandMark: {
    backgroundColor: color.green,
    color: color.white,
    fontSize: 20,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 31,
    borderRadius: 9,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  between: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  heading: { gap: 8, backgroundColor: '#103d3a', padding: 24, borderRadius: 24 },
  headingDescription: { fontSize: 15, lineHeight: 22, color: '#d3e6df' },
  kicker: { fontSize: 11, letterSpacing: 2, fontWeight: '800', color: '#b8e6ae' },
  h1: {
    fontSize: 35,
    lineHeight: 38,
    letterSpacing: -1.65,
    fontWeight: '800',
    color: color.white,
  },
  h2: { fontSize: 18, letterSpacing: -0.45, fontWeight: '800', color: color.ink },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.dark,
    borderRadius: 22,
    padding: 20,
    minHeight: 90,
  },
  bannerValue: {
    fontSize: 35,
    lineHeight: 40,
    letterSpacing: -1.4,
    fontWeight: '800',
    color: color.white,
  },
  bannerLabel: { fontSize: 13, color: '#d8eee3', lineHeight: 18 },
  bannerIcon: { fontSize: 36, color: '#b2dbc4', marginHorizontal: 6 },
  card: {
    backgroundColor: color.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: color.line,
    padding: 19,
    gap: 13,
  },
  tint: { backgroundColor: color.pale },
  body: { color: color.body, fontSize: 14, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '700', color: color.ink },
  meta: { fontSize: 12, color: color.body },
  reading: { fontSize: 18, fontWeight: '800', color: color.green },
  field: { gap: 6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: '#bdcec3',
    borderRadius: 12,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: color.ink,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  compact: { minHeight: 36, paddingHorizontal: 10 },
  primary: { backgroundColor: color.green, borderColor: color.green },
  secondary: { backgroundColor: color.white, borderColor: '#cdded2' },
  buttonLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipActive: { backgroundColor: color.pale, borderColor: color.green },
  chipLabel: { fontSize: 13, fontWeight: '700', color: color.body },
  gauge: { flexDirection: 'row', gap: 3 },
  gaugeCell: { flex: 1, gap: 7, alignItems: 'center', paddingVertical: 7 },
  segment: { alignSelf: 'stretch', height: 6, borderRadius: 4, backgroundColor: '#d9e7dd' },
  segmentActive: { backgroundColor: '#83b9a1' },
  segmentSelected: { backgroundColor: color.dark },
  tick: { fontSize: 11, color: color.body },
  tickSelected: { color: color.dark, fontWeight: '800' },
  notice: {
    backgroundColor: '#e5f3ea',
    padding: 12,
    borderRadius: 12,
    color: color.dark,
    fontWeight: '600',
  },
  error: { backgroundColor: '#f9eae7', color: '#85362d' },
  tile: {
    backgroundColor: color.bg,
    borderColor: color.line,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    gap: 5,
  },
  dock: { backgroundColor: color.white, borderTopWidth: 1, borderColor: color.line },
  dockInner: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 5, gap: 2 },
  selectedTab: { backgroundColor: color.pale, borderRadius: 14 },
  tabIcon: { fontSize: 20, color: '#566f62' },
  tabText: { fontSize: 11, color: '#52685b', fontWeight: '600' },
  tabActive: { color: color.green, fontWeight: '900' },
  chart: { flexDirection: 'row', gap: 9, height: 86, alignItems: 'flex-end' },
  barColumn: { flex: 1, alignItems: 'center', gap: 5 },
  bar: { width: '65%', maxWidth: 30, backgroundColor: '#a7d1ba', borderRadius: 5 },
  foot: { fontSize: 11, textAlign: 'center', color: color.body },
});

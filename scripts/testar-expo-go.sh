#!/usr/bin/env bash
set -eu
adb install "$RUNNER_TEMP/expo.apk"
adb reverse tcp:8081 tcp:8081
adb shell am start -a android.intent.action.VIEW -d exp://127.0.0.1:8081 host.exp.exponent
for i in $(seq 1 90); do
  if adb shell uiautomator dump /sdcard/tela.xml >/dev/null 2>&1 &&
     adb shell cat /sdcard/tela.xml | grep -q 'Entrar'; then
    echo 'O Expo Go abriu a tela de login.'
    exit 0
  fi
  sleep 2
done
cat "$RUNNER_TEMP/metro.log"
adb logcat -d -s ReactNativeJS ReactNative AndroidRuntime | tail -100
adb shell cat /sdcard/tela.xml
exit 1

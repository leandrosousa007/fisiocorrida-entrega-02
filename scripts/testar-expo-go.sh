#!/usr/bin/env bash
set -eu
adb install "$RUNNER_TEMP/expo.apk"
adb reverse tcp:8081 tcp:8081
adb shell am start -a android.intent.action.VIEW -d exp://127.0.0.1:8081 host.exp.exponent
for i in $(seq 1 45); do
  if adb shell uiautomator dump /sdcard/tela.xml >/dev/null 2>&1; then
    adb shell cat /sdcard/tela.xml > "$RUNNER_TEMP/tela.xml"
    if grep -q 'Acesse sua conta' "$RUNNER_TEMP/tela.xml"; then
      echo 'O Expo Go abriu a tela de login.'
      exit 0
    fi
    # O primeiro uso do Expo Go pode exibir um tutorial sobre o app.
    if grep -q 'developer menu' "$RUNNER_TEMP/tela.xml"; then
      bounds=$(sed -n 's/.*text="Continue"[^>]*bounds="\[\([0-9]*\),\([0-9]*\)\]\[\([0-9]*\),\([0-9]*\)\]".*/\1 \2 \3 \4/p' "$RUNNER_TEMP/tela.xml")
      if [[ -n "$bounds" ]]; then
        read -r x1 y1 x2 y2 <<< "$bounds"
        adb shell input tap "$(((x1+x2)/2))" "$(((y1+y2)/2))"
      else
        adb shell input keyevent 4
      fi
    elif grep -q 'content-desc="Close"' "$RUNNER_TEMP/tela.xml" && grep -qi 'reload' "$RUNNER_TEMP/tela.xml"; then
      adb shell input keyevent 4
    fi
  fi
  sleep 2
done
cat "$RUNNER_TEMP/metro.log"
adb logcat -d -s ReactNativeJS ReactNative AndroidRuntime | tail -100
cat "$RUNNER_TEMP/tela.xml"
exit 1

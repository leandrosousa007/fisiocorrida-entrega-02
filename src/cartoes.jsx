import React from 'react';
import { Text, View } from 'react-native';
import { Body, Card, styles } from './interface';

export const formatarData = (data) => data.split('-').reverse().join('/');

export function ExerciseRow({ number, name, detail, children }) {
  return (
    <View style={styles.tile}>
      <View style={styles.row}>
        <Text style={styles.reading}>{number}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{name}</Text>
          {detail && <Body>{detail}</Body>}
        </View>
      </View>
      {children}
    </View>
  );
}
export function SessionList({ rows, exercise }) {
  return (
    <Card title="Sessões recentes">
      {rows.length ? (
        rows.map((session) => (
          <View style={styles.tile} key={session.plano + session.data}>
            <View style={styles.between}>
              <Text style={styles.label}>{formatarData(session.data)}</Text>
              <Text style={styles.reading}>
                {session.antes} → {session.depois}
              </Text>
            </View>
            <Body>
              Versão {session.versao} · {session.realizados.length} de {session.total} itens
              concluídos
            </Body>
            {session.realizados.length > 0 && (
              <Body>{session.realizados.map((id) => exercise(id).nome).join(', ')}</Body>
            )}
            {session.comentario && <Body>{session.comentario}</Body>}
          </View>
        ))
      ) : (
        <Body>Nenhuma sessão registrada.</Body>
      )}
    </Card>
  );
}

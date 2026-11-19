import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { ExerciseRow, SessionList, formatarData } from './src/cartoes';
import { loadClinic } from './src/demonstracao';
import { ItemPlano, hoje } from './src/modelo';
import { PATIENT, PROFESSIONAL } from './src/perfis';
import {
  Banner,
  Body,
  Button,
  Card,
  Choice,
  color,
  Field,
  Heading,
  Pain,
  styles,
  Tabs,
} from './src/interface';

const patientTabs = [
  ['Plano', 'Plano', '▤'],
  ['Relato', 'Relato', '◎'],
  ['Sessão', 'Sessão', '✓'],
  ['Histórico', 'Histórico', '☷'],
];
const professionalTabs = [
  ['Catálogo', 'Exercícios', '✦'],
  ['Prescrever', 'Plano', '▤'],
  ['Evolução', 'Evolução', '↗'],
  ['Versões', 'Versões', '◷'],
];
const headings = {
  Plano: [
    'ACOMPANHAMENTO',
    'Meu plano',
    'Consulte os exercícios e as orientações da versão vigente.',
  ],
  Relato: [
    'SEU PONTO DE PARTIDA',
    'Como está seu joelho?',
    'Conte como a dor afetou suas corridas.',
  ],
  Sessão: [
    'SEU TREINO GUIADO',
    'Sessão de hoje',
    'Registre o que realizou e como se sentiu antes e depois.',
  ],
  Histórico: [
    'SEU ACOMPANHAMENTO',
    'Histórico',
    'Revise seus registros para a próxima conversa com o profissional.',
  ],
  Catálogo: [
    'ÁREA PROFISSIONAL',
    'Exercícios',
    'Encontre exercícios para montar planos individuais.',
  ],
  Evolução: ['VISÃO PROFISSIONAL', 'Evolução', 'Resumo dos registros entre as consultas.'],
  Versões: [
    'HISTÓRICO DO PLANO',
    'Versões',
    'Consulte o que mudou ao longo do acompanhamento.',
  ],
};

export default function App() {
  const [clinic, setClinic] = useState(null);
  const [page, setPage] = useState('Acesso');
  const [patient, setPatient] = useState('');
  const [values, setValues] = useState({});
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const scroll = useRef(null),
    lock = useRef(false);
  useEffect(() => {
    loadClinic()
      .then(setClinic)
      .catch((error) => setMessage({ text: error.message, error: true }));
  }, []);

  const user = clinic?.usuario;
  const isProfessional = user?.papel === PROFESSIONAL;
  const users = clinic?.d.usuarios || [];
  const patients = users.filter((u) => u.papel === PATIENT && u.profissional === user?.id);
  const professionals = users.filter((u) => u.papel === PROFESSIONAL);
  const plan = user && patient ? clinic.vigente(patient) : null;
  const exercise = (id) => clinic.d.exercicios.find((e) => e.id === id);
  const selectedPatient = users.find((u) => u.id === patient);
  const set = (key, value) => setValues((previous) => ({ ...previous, [key]: value }));
  const val = (key) => values[key] ?? '';
  function top() {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  function go(next, id = patient) {
    let initial = {};
    if (next === 'Relato') initial.dor = '0';
    if (next === 'Sessão') initial = { data: hoje(), antes: '0', depois: '0' };
    if (next === 'Prescrever' && id) {
      const current = clinic.vigente(id);
      if (current) {
        initial.orient = current.orientacao;
        for (const item of current.itens) {
          initial[item.exercicio] = true;
          initial['dose' + item.exercicio] = item.dose;
          initial['freq' + item.exercicio] = item.frequencia;
        }
      }
    }
    setValues(initial);
    setShowPassword(false);
    setMessage(null);
    setPage(next);
    top();
  }
  function ok(text) {
    setMessage({ text });
  }
  async function run(action) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage(null);
    try {
      await action();
    } catch (error) {
      setMessage({ text: error.message, error: true });
    } finally {
      lock.current = false;
      setBusy(false);
      top();
    }
  }
  async function login() {
    const account = await clinic.autenticar(val('email'), val('senha'));
    const id =
      account.papel === PATIENT
        ? account.id
        : users.find((u) => u.profissional === account.id)?.id || '';
    setPatient(id);
    go(account.papel === PATIENT ? 'Plano' : 'Evolução', id);
  }
  const input = (key, label, props = {}) => (
    <Field label={label} value={val(key)} onChange={(value) => set(key, value)} {...props} />
  );
  const action = (title, fn) => (
    <Button title={title} disabled={busy} onPress={() => run(fn)} />
  );
  const choices = (key, options, selected) => (
    <View style={styles.row}>
      {options.map(([id, title]) => (
        <Choice
          key={id}
          title={title}
          selected={selected === id}
          onPress={() => set(key, id)}
        />
      ))}
    </View>
  );
  const pain = (key, label) => (
    <Pain label={label} value={val(key) || '0'} onChange={(value) => set(key, value)} />
  );

  function access() {
    const registering = page === 'Cadastro';
    const role = values.papel || PATIENT;
    return (
      <>
        <Heading
          kicker="CUIDAR DO MOVIMENTO"
          title={registering ? 'Crie sua conta' : 'Corra com mais confiança.'}
          description={
            registering
              ? 'Escolha seu perfil para começar o acompanhamento.'
              : 'Seu plano, suas sessões e seus relatos em um só lugar, com acompanhamento profissional.'
          }
        />
        {!registering && (
          <Banner value="Plano e sessões" label="Acompanhamento entre consultas" side="⌁" />
        )}
        {registering && (
          <>
            {choices(
              'papel',
              [
                [PATIENT, PATIENT],
                [PROFESSIONAL, PROFESSIONAL],
              ],
              role,
            )}
            {input('nome', 'Nome completo', { autoComplete: 'name' })}
          </>
        )}
        {input('email', 'E-mail', {
          autoCapitalize: 'none',
          autoComplete: 'email',
          keyboardType: 'email-address',
          placeholder: 'seu.email@exemplo.com',
        })}
        {input('senha', 'Senha', {
          secureTextEntry: !showPassword,
          autoComplete: registering ? 'new-password' : 'current-password',
          placeholder: registering ? 'Pelo menos 6 caracteres' : 'Digite sua senha',
          trailing: (
            <Button
              compact
              active={false}
              title={showPassword ? 'Ocultar' : 'Mostrar'}
              onPress={() => setShowPassword(!showPassword)}
            />
          ),
        })}
        {registering &&
          (role === PROFESSIONAL ? (
            input('registro', 'Registro profissional')
          ) : (
            <>
              <Text style={styles.label}>Fisioterapeuta responsável</Text>
              {choices(
                'vinculo',
                professionals.map((u) => [u.id, u.nome]),
                values.vinculo || professionals[0]?.id,
              )}
            </>
          ))}
        {registering
          ? action('Cadastrar', async () => {
              await clinic.cadastrar(
                val('nome'),
                val('email'),
                val('senha'),
                role,
                role === PROFESSIONAL
                  ? val('registro')
                  : values.vinculo || professionals[0]?.id,
              );
              go('Acesso');
              set('email', val('email').trim());
              ok('Conta criada. Entre com seu e-mail e senha.');
            })
          : action('Entrar', login)}
        <Button
          active={false}
          title={registering ? 'Voltar ao login' : 'Criar conta'}
          onPress={() => go(registering ? 'Acesso' : 'Cadastro')}
        />
        {!registering && (
          <Card title="Contas de demonstração">
            <Body>Escolha um perfil para preencher os campos e depois toque em Entrar.</Body>
            <View style={styles.row}>
              {[
                ['Lucas · paciente', 'lucas'],
                ['Rafaela · fisioterapeuta', 'rafaela'],
              ].map(([title, name]) => (
                <Button
                  key={name}
                  compact
                  active={false}
                  title={title}
                  onPress={() => {
                    setValues({ email: name + '@example.test', senha: 'demo123' });
                    setShowPassword(false);
                    setMessage(null);
                    top();
                  }}
                />
              ))}
            </View>
          </Card>
        )}
        <Text style={styles.foot}>Ambiente acadêmico · Utilize apenas dados fictícios</Text>
      </>
    );
  }

  function planCard(item) {
    const current = item.id === plan?.id;
    return (
      <Card
        key={item.id}
        title={current ? 'Plano vigente' : 'Versão anterior'}
        tinted={current}
      >
        <Text style={styles.meta}>
          Versão {item.versao} · {formatarData(item.data)} ·{' '}
          {users.find((u) => u.id === item.autor)?.nome}
        </Text>
        {item.itens.map((entry, index) => {
          const detail = exercise(entry.exercicio);
          return (
            <ExerciseRow
              key={entry.exercicio}
              number={String(index + 1).padStart(2, '0')}
              name={detail.nome}
              detail={entry.dose + ' · ' + entry.frequencia}
            >
              <Body>{detail.instrucao}</Body>
              {detail.cuidado && <Body>{detail.cuidado}</Body>}
            </ExerciseRow>
          );
        })}
        <Text style={styles.label}>Orientações</Text>
        <Body>{item.orientacao || 'Sem orientações adicionais.'}</Body>
        {item.motivo && <Body>Motivo da revisão · {item.motivo}</Body>}
      </Card>
    );
  }

  function workspace() {
    const catalog = clinic.d.exercicios.filter((item) => item.autor === user.id);
    if (page === 'Catálogo') {
      const visible = catalog.filter((item) =>
        item.nome
          .toLocaleLowerCase('pt-BR')
          .includes(val('busca').trim().toLocaleLowerCase('pt-BR')),
      );
      return (
        <>
          {input('busca', 'Buscar exercício', { placeholder: 'Nome do exercício' })}
          <Card title={'Catálogo · ' + visible.length}>
            {visible.length ? (
              visible.map((item) => (
                <ExerciseRow
                  key={item.id}
                  number="↗"
                  name={item.nome}
                  detail={item.instrucao}
                >
                  {item.cuidado && <Body>{item.cuidado}</Body>}
                </ExerciseRow>
              ))
            ) : (
              <Body>Nenhum exercício encontrado.</Body>
            )}
          </Card>
          <Button
            active={false}
            title={values.novo ? 'Fechar cadastro' : '+ Cadastrar exercício'}
            onPress={() => set('novo', !values.novo)}
          />
          {values.novo && (
            <Card title="Novo exercício">
              {input('nome', 'Nome')}
              {input('instrucao', 'Instrução')}
              {input('cuidado', 'Cuidado opcional')}
              {action('Salvar exercício', async () => {
                await clinic.cadastrarExercicio(val('nome'), val('instrucao'), val('cuidado'));
                go('Catálogo');
                ok('Exercício salvo.');
              })}
            </Card>
          )}
        </>
      );
    }
    if (!patient)
      return (
        <Card>
          <Body>Vincule um paciente a este perfil no cadastro para iniciar.</Body>
        </Card>
      );
    if (page === 'Relato')
      return (
        <>
          <Text style={styles.label}>Onde sente desconforto?</Text>
          {choices(
            'lado',
            ['Esquerdo', 'Direito', 'Ambos'].map((side) => [side, side]),
            values.lado || 'Esquerdo',
          )}
          {pain('dor', 'Intensidade da dor')}
          {input('impacto', 'Impacto na corrida', {
            placeholder: 'Exemplo: precisei reduzir o ritmo',
          })}
          {input('objetivo', 'Seu objetivo', {
            placeholder: 'Exemplo: voltar a correr com conforto',
          })}
          {input('modalidade', 'Modalidade de corrida', {
            placeholder: 'Rua, trilha ou pista',
          })}
          {input('obs', 'Observações', {
            multiline: true,
            placeholder: 'Algo mais que o profissional precisa saber?',
          })}
          {action('Salvar relato', async () => {
            await clinic.registrarRelato(
              values.lado || 'Esquerdo',
              Number(val('dor')),
              val('impacto'),
              val('objetivo'),
              val('modalidade'),
              val('obs'),
            );
            go('Relato');
            ok('Relato salvo.');
          })}
        </>
      );
    if (page === 'Prescrever')
      return (
        <>
          {plan && planCard(plan)}
          <Card title={plan ? 'Revisar plano' : 'Criar plano'}>
            {!catalog.length && <Body>Cadastre um exercício antes de publicar o plano.</Body>}
            {catalog.map((item) => (
              <View style={styles.tile} key={item.id}>
                <Choice
                  title={item.nome}
                  selected={!!values[item.id]}
                  onPress={() => set(item.id, !values[item.id])}
                />
                {values[item.id] && (
                  <>
                    {input('dose' + item.id, 'Séries e repetições ou duração')}
                    {input('freq' + item.id, 'Frequência')}
                  </>
                )}
              </View>
            ))}
            {input('orient', 'Orientações gerais', { multiline: true })}
            {plan && input('motivo', 'Motivo da revisão')}
            {action('Publicar versão', async () => {
              const items = catalog
                .filter((item) => values[item.id])
                .map(
                  (item) =>
                    new ItemPlano(item.id, val('dose' + item.id), val('freq' + item.id)),
                );
              await clinic.publicar(patient, items, val('orient'), val('motivo'));
              go('Versões');
              ok('Versão publicada.');
            })}
          </Card>
        </>
      );
    if (page === 'Versões') {
      const versions = clinic.versoes(patient);
      return versions.length ? (
        versions.map(planCard)
      ) : (
        <Card>
          <Body>Nenhum plano publicado.</Body>
        </Card>
      );
    }
    if (page === 'Histórico' || page === 'Evolução') {
      const sessions = clinic.evolucao(patient);
      const recent = sessions[0];
      const possible = sessions.reduce((total, session) => total + session.total, 0);
      const done = sessions.reduce((total, session) => total + session.realizados.length, 0);
      return (
        <>
          {isProfessional && recent && (
            <Banner
              value={recent.antes + ' → ' + recent.depois}
              label="Dor antes e depois da última sessão · 0 a 10"
              side={
                recent.depois > recent.antes ? '↗' : recent.depois < recent.antes ? '↘' : '→'
              }
            />
          )}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Card tinted>
                <Text style={styles.reading}>{sessions.length}</Text>
                <Body>Sessões registradas</Body>
              </Card>
            </View>
            {isProfessional && possible > 0 && (
              <View style={{ flex: 1 }}>
                <Card tinted>
                  <Text style={styles.reading}>{Math.round((done / possible) * 100)}%</Text>
                  <Body>Itens concluídos</Body>
                </Card>
              </View>
            )}
          </View>
          {isProfessional && sessions.length > 0 && (
            <Card title="Dor após as sessões">
              <View
                accessibilityLabel="Dor após cada sessão em ordem cronológica"
                style={styles.chart}
              >
                {sessions
                  .slice(0, 5)
                  .reverse()
                  .map((session) => (
                    <View key={session.plano + session.data} style={styles.barColumn}>
                      <Text style={styles.meta}>{session.depois}/10</Text>
                      <View style={[styles.bar, { height: 5 + session.depois * 4.8 }]} />
                      <Text style={styles.meta}>{formatarData(session.data).slice(0, 5)}</Text>
                    </View>
                  ))}
              </View>
            </Card>
          )}
          {isProfessional && (
            <Card title={'Relatos de ' + selectedPatient.nome}>
              <Body>{selectedPatient.objetivo || 'Objetivo ainda não informado'}</Body>
              {clinic.d.relatos
                .filter((item) => item.paciente === patient)
                .reverse()
                .map((item, index) => (
                  <View style={styles.tile} key={index}>
                    <Text style={styles.label}>
                      {formatarData(item.data)} · {item.lado} · Dor {item.dor}/10
                    </Text>
                    <Body>
                      {item.impacto} {item.observacao}
                    </Body>
                  </View>
                ))}
            </Card>
          )}
          <SessionList rows={sessions} exercise={exercise} />
          <Button
            title={isProfessional ? 'Revisar plano' : 'Nova sessão'}
            onPress={() => go(isProfessional ? 'Prescrever' : 'Sessão')}
          />
        </>
      );
    }
    if (!plan)
      return (
        <Card>
          <Body>Aguardando o primeiro plano.</Body>
        </Card>
      );
    if (page === 'Plano')
      return (
        <>
          {planCard(plan)}
          <Button title="Registrar sessão" onPress={() => go('Sessão')} />
        </>
      );
    return (
      <>
        <Card title="Plano da sessão" tinted>
          <Body>
            Versão {plan.versao} · {plan.itens.length} exercícios
          </Body>
        </Card>
        {input('data', 'Data (AAAA-MM-DD)')}
        <Card title="Itens realizados">
          {plan.itens.map((item) => (
            <Choice
              key={item.exercicio}
              title={exercise(item.exercicio).nome}
              selected={!!values[item.exercicio]}
              onPress={() => set(item.exercicio, !values[item.exercicio])}
            />
          ))}
        </Card>
        {pain('antes', 'Dor antes da sessão')}
        {pain('depois', 'Dor depois da sessão')}
        {input('obs', 'Comentário', { multiline: true, placeholder: 'Como foi sua sessão?' })}
        {action('Salvar sessão', async () => {
          const done = plan.itens
            .filter((item) => values[item.exercicio])
            .map((item) => item.exercicio);
          const before = Number(val('antes')),
            after = Number(val('depois'));
          const result = await clinic.registrarSessao(
            val('data'),
            before,
            after,
            done,
            val('obs'),
          );
          go('Histórico');
          ok(
            after > before
              ? result + ' Dor antes: ' + before + '/10. Dor depois: ' + after + '/10.'
              : result,
          );
        })}
      </>
    );
  }

  const [kicker, title, description] =
    page === 'Prescrever'
      ? [
          'ACOMPANHAMENTO',
          selectedPatient ? 'Plano de ' + selectedPatient.nome : 'Plano',
          'Personalize os exercícios e as orientações.',
        ]
      : headings[page] || [];
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.screen,
        {
          paddingTop: Platform.OS === 'web' ? 18 : 48,
          paddingBottom: Platform.OS === 'ios' ? 18 : 0,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.row}>
          <Text style={styles.brandMark}>⌁</Text>
          <Text style={styles.brand}>FisioCorrida</Text>
        </View>
        {user && (
          <View style={styles.row}>
            <Text style={styles.meta}>{user.nome}</Text>
            <Button
              title="Sair"
              active={false}
              compact
              onPress={() => {
                clinic.usuario = null;
                setPatient('');
                go('Acesso');
              }}
            />
          </View>
        )}
      </View>
      <ScrollView
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        {message && (
          <Text
            accessibilityRole="alert"
            style={[styles.notice, message.error && styles.error]}
          >
            {message.text}
          </Text>
        )}
        {busy && <ActivityIndicator color={color.green} />}
        {!clinic ? (
          <ActivityIndicator color={color.green} />
        ) : (
          <View pointerEvents={busy ? 'none' : 'auto'} style={{ gap: 14 }}>
            {user ? (
              <>
                <Heading {...{ kicker, title, description }} />
                {isProfessional && page !== 'Catálogo' && patients.length > 0 && (
                  <View style={styles.row}>
                    {patients.map((p) => (
                      <Choice
                        key={p.id}
                        title={p.nome}
                        selected={p.id === patient}
                        onPress={() => {
                          setPatient(p.id);
                          go(page, p.id);
                        }}
                      />
                    ))}
                  </View>
                )}
                {workspace()}
              </>
            ) : (
              access()
            )}
          </View>
        )}
      </ScrollView>
      {user && (
        <Tabs
          items={isProfessional ? professionalTabs : patientTabs}
          page={page}
          onSelect={go}
        />
      )}
    </KeyboardAvoidingView>
  );
}

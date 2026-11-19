import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { Exercicio, Fisioterapeuta, Paciente, Plano, Relato, Sessao, hoje } from './entidades';

function exigir(t, m) {
  if (!t) throw Error(m);
}
const escala = (x) => Number.isInteger(x) && x >= 0 && x <= 10;
async function digest(senha, sal) {
  const result = await pbkdf2Async(sha256, senha, sal, {
    c: 100000,
    dkLen: 32,
    asyncTick: 12,
  });
  return Array.from(result).join('.');
}
class Clinica {
  constructor(d) {
    this.d = d || { usuarios: [], relatos: [], exercicios: [], planos: [], sessoes: [] };
    this.usuario = null;
  }

  salvar() {
    return AsyncStorage.setItem('fc2.v1', JSON.stringify(this.d));
  }

  async cadastrar(nome, email, senha, papel, vinculo) {
    email = email.trim().toLowerCase();
    exigir(
      nome.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && senha.length >= 6,
      'Informe nome, e-mail e senha de pelo menos seis caracteres.',
    );
    exigir(!this.d.usuarios.some((u) => u.email === email), 'E-mail já cadastrado.');
    const paciente = papel === 'Paciente';
    exigir(
      paciente
        ? this.d.usuarios.some((u) => u.id === vinculo && u.papel === 'Fisioterapeuta')
        : papel === 'Fisioterapeuta' && vinculo.trim(),
      'Informe o profissional ou o registro.',
    );
    const sal = randomUUID(),
      Tipo = paciente ? Paciente : Fisioterapeuta,
      u = new Tipo(nome, email, papel, await digest(senha, sal), sal);
    u[paciente ? 'profissional' : 'registro'] = vinculo;
    this.d.usuarios.push(u);
    await this.salvar();
    return u;
  }

  async autenticar(email, senha) {
    const conta = this.d.usuarios.find(
      (usuario) => usuario.email === email.trim().toLowerCase(),
    );
    exigir(
      conta && (await digest(senha, conta.sal)) === conta.hash,
      'E-mail ou senha incorretos. Tente novamente.',
    );
    this.usuario = conta;
    return conta;
  }

  acesso(id) {
    const u = this.usuario,
      p = this.d.usuarios.find((x) => x.id === id && x.papel === 'Paciente');
    exigir(p && u && (p.id === u.id || p.profissional === u.id), 'Paciente indisponível.');
    return p;
  }

  async registrarRelato(lado, dor, impacto, objetivo, modalidade, obs) {
    const p = this.acesso(this.usuario.id);
    exigir(
      escala(dor) &&
        impacto.trim() &&
        objetivo.trim() &&
        ['Esquerdo', 'Direito', 'Ambos'].includes(lado),
      'Preencha o relato e informe dor entre 0 e 10.',
    );
    Object.assign(p, { objetivo, modalidade });
    this.d.relatos.push(new Relato(p.id, lado, dor, impacto, obs));
    await this.salvar();
  }

  async cadastrarExercicio(nome, instrucao, cuidado) {
    exigir(
      this.usuario.papel === 'Fisioterapeuta' && nome.trim() && instrucao.trim(),
      'Informe nome e instrução.',
    );
    this.d.exercicios.push(new Exercicio(this.usuario.id, nome, instrucao, cuidado));
    await this.salvar();
  }

  planosDoPaciente(id) {
    this.acesso(id);
    return this.d.planos
      .filter((p) => p.paciente === id)
      .slice()
      .reverse();
  }

  versoes(id) {
    exigir(
      this.usuario?.papel === 'Fisioterapeuta',
      'A consulta de versões é restrita ao profissional responsável.',
    );
    return this.planosDoPaciente(id);
  }

  vigente(id) {
    return this.planosDoPaciente(id)[0];
  }

  async publicar(id, itens, orientacao, motivo) {
    const p = this.acesso(id),
      v = this.vigente(id);
    exigir(
      p.profissional === this.usuario.id &&
        itens.length &&
        new Set(itens.map((item) => item.exercicio)).size === itens.length &&
        itens.every(
          (i) =>
            this.d.exercicios.some(
              (e) => e.id === i.exercicio && e.autor === this.usuario.id,
            ) &&
            i.dose.trim() &&
            i.frequencia.trim(),
        ),
      'Selecione ao menos um exercício e preencha dosagem e frequência.',
    );
    exigir(!v || motivo.trim(), 'Descreva o motivo da revisão.');
    this.d.planos.push(
      new Plano(this.usuario.id, id, (v?.versao || 0) + 1, itens, orientacao, motivo),
    );
    await this.salvar();
  }

  async registrarSessao(data, antes, depois, realizados, comentario) {
    const p = this.vigente(this.usuario.id);
    exigir(
      p &&
        /^\d{4}-\d{2}-\d{2}$/.test(data) &&
        !isNaN(Date.parse(data)) &&
        new Date(data).toISOString().slice(0, 10) === data &&
        data <= hoje() &&
        escala(antes) &&
        escala(depois),
      'Confira a data e os valores de dor.',
    );
    exigir(
      realizados.every((id) => p.itens.some((i) => i.exercicio === id)),
      'Item fora do plano.',
    );
    exigir(
      !this.d.sessoes.some((s) => s.plano === p.id && s.data === data),
      'Já existe uma sessão desse plano nessa data. Confira o registro na aba Histórico.',
    );
    this.d.sessoes.push(new Sessao(p.id, data, antes, depois, realizados, comentario));
    await this.salvar();
    return depois > antes
      ? 'Sessão salva. A dor aumentou. Converse com seu fisioterapeuta.'
      : 'Sessão salva.';
  }

  historico(id) {
    const planos = this.planosDoPaciente(id);
    return this.d.sessoes
      .filter((s) => planos.some((p) => p.id === s.plano))
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  evolucao(id) {
    return this.historico(id).map((s) => {
      const p = this.d.planos.find((p) => p.id === s.plano);
      return { ...s, versao: p.versao, total: p.itens.length };
    });
  }
}
export { Clinica };
export { ItemPlano, hoje } from './entidades';

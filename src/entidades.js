import { randomUUID } from './uuid';

function localDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export class Usuario {
  constructor(nome, email, papel, hash, sal) {
    Object.assign(this, { id: randomUUID(), nome, email, papel, hash, sal });
  }
}
export class Paciente extends Usuario {}
export class Fisioterapeuta extends Usuario {}
export class Relato {
  constructor(paciente, lado, dor, impacto, observacao) {
    Object.assign(this, { paciente, lado, dor, impacto, observacao, data: hoje() });
  }
}
export class Exercicio {
  constructor(autor, nome, instrucao, cuidado) {
    Object.assign(this, { id: randomUUID(), autor, nome, instrucao, cuidado });
  }
}
export class ItemPlano {
  constructor(exercicio, dose, frequencia) {
    Object.assign(this, { exercicio, dose, frequencia });
  }
}
export class Plano {
  constructor(autor, paciente, versao, itens, orientacao, motivo) {
    Object.assign(this, {
      id: randomUUID(),
      autor,
      paciente,
      versao,
      itens,
      orientacao,
      motivo,
      data: hoje(),
    });
  }
}
export class Sessao {
  constructor(plano, data, antes, depois, itens, comentario) {
    Object.assign(this, { plano, data, antes, depois, itens, comentario });
  }
}

export class Realiza {
  constructor(exercicio, concluido, observacao = '') {
    Object.assign(this, { exercicio, concluido, observacao });
  }
}

export const hoje = () => localDate();

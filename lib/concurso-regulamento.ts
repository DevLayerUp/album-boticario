export type RegulamentoBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

export interface RegulamentoSection {
  id: string;
  title: string;
  blocks: RegulamentoBlock[];
}

export const CONCURSO_REGULAMENTO_TITLE = "Regulamento do Concurso Cultural";
export const CONCURSO_REGULAMENTO_SUBTITLE = "Fãs por Natureza";
export const CONCURSO_REGULAMENTO_PROMOTORA =
  "PROMOTORA: A FUNDAÇÃO GRUPO BOTICÁRIO DE PROTEÇÃO À NATUREZA, inscrita no CNPJ/MF sob o nº 81.915.050/0001-09, com sede na Rua Gonçalves Dias, 225 - Batel - Curitiba, Paraná, promove este Concurso Cultural, que será regido pelas condições estabelecidas a seguir.";

export const CONCURSO_REGULAMENTO_SECTIONS: RegulamentoSection[] = [
  {
    id: "contexto",
    title: "1. Contexto e objetivos do concurso",
    blocks: [
      {
        type: "p",
        text: '1.1. A Fundação Grupo Boticário de Proteção à Natureza lançou o álbum de figurinhas digital e gratuito "Fãs por Natureza", uma iniciativa gamificada que conecta educação ambiental e biodiversidade brasileira para aproximar o público da conservação da nossa fauna e da nossa flora.',
      },
      {
        type: "p",
        text: "1.2. O presente Concurso de caráter exclusivamente cultural, recreativo e artístico, visa incentivar a expressão criativa da nossa comunidade de colecionadores (a Fan Base do álbum) e do público geral.",
      },
      {
        type: "p",
        text: '1.3. O objetivo do concurso é engajar os participantes a refletirem sobre a sua própria rotina, demonstrando como as ações e hábitos do dia a dia podem se conectar diretamente com o propósito de ser um "Fã por Natureza", valorizando o cuidado e o respeito com a biodiversidade do nosso planeta.',
      },
    ],
  },
  {
    id: "publico",
    title: "2. Público-alvo e requisitos de participação",
    blocks: [
      {
        type: "p",
        text: '2.1. O presente Concurso é aberto a qualquer pessoa física, maior de 18 anos, residente e domiciliada em território nacional, cadastrada ou que venha a se cadastrar na plataforma do álbum digital "Fãs por Natureza" (https://www.faspornatureza.com.br/), durante o período desta Campanha.',
      },
      {
        type: "p",
        text: "2.2. Não há qualquer exigência de pontuação mínima, nível de ranking ou quantidade de figurinhas coladas no álbum para participar deste Concurso Cultural, garantindo isonomia e igualdade de condições a todos os membros cadastrados na base.",
      },
      {
        type: "p",
        text: "2.3. Estão impedidos de participar:",
      },
      {
        type: "list",
        items: [
          "Colaboradores ativos da Fundação Grupo Boticário e de outras unidades do Grupo Boticário;",
          "Membros da equipe organizadora da Ação e seus familiares colaboradores da Fundação Grupo Boticário e Grupo Boticário.",
        ],
      },
      {
        type: "p",
        text: "2.3. A participação é voluntária, não envolve qualquer tipo de remuneração e poderá ser reconhecida por meio de experiências, vivências ou brindes simbólicos, conforme critérios definidos pela Fundação.",
      },
    ],
  },
  {
    id: "cronograma",
    title: "3. Cronograma e vigência",
    blocks: [
      {
        type: "p",
        text: "3.1. O Concurso obedecerá ao seguinte cronograma de execução:",
      },
      {
        type: "list",
        items: [
          "Período de inscrição e envio de respostas: de 28/09/2026 até 12/10/2026, às 23h59 (horário de Brasília).",
          "Período de avaliação (Comissão Julgadora): de 14/10/2026 a 23/10/2026.",
          "Divulgação Oficial dos Vencedores: dia 26/10/2026 nos canais digitais oficiais da Fundação Grupo Boticário e via notificação direta na plataforma do Álbum.",
          "Entrega dos Prêmios: a partir de 29/10/2026, com envio logístico a ser acordado diretamente com os vencedores.",
        ],
      },
      {
        type: "p",
        text: "3.2. As datas deste cronograma poderão ser alteradas, suspensas ou prorrogadas a critério exclusivo da comissão organizadora, mediante aviso publicado no site do álbum e redes sociais.",
      },
    ],
  },
  {
    id: "mecanica",
    title: "4. Mecânica de participação",
    blocks: [
      {
        type: "p",
        text: "4.1. A participação no Concurso é totalmente voluntária, gratuita e sem qualquer necessidade de compra de produtos, pagamento de taxas ou elementos de sorteio/aleatoriedade.",
      },
      {
        type: "p",
        text: "4.2. Para concorrer, o participante deverá:",
      },
      {
        type: "list",
        items: [
          "Acessar o site https://www.faspornatureza.com.br/ e fazer o login na sua conta, ou criar uma nova conta caso não tenha.",
          "Clicar no link de participação disponível no pop-up de aviso interno da plataforma ou no link enviado diretamente via e-mail marketing e SMS.",
          "Preencher e confirmar as informações cadastrais requeridas (nome completo, e-mail cadastrado na plataforma do álbum, telefone com WhatsApp para contato e CPF para fins de validação do prêmio).",
          "Responder ao desafio criativo, enviando uma frase autoral e criativa de até 500 (quinhentos) caracteres (incluindo espaços), inserida diretamente no campo indicado do formulário, em resposta à seguinte pergunta reflexiva:",
        ],
      },
      {
        type: "quote",
        text: "Como você demonstra a sua paixão pela natureza?",
      },
      {
        type: "p",
        text: "4.3. A frase deverá ser digitada diretamente no campo próprio do formulário de inscrição. Não será aceito o envio de arquivos anexos, vídeos ou links externos. Não será responsabilidade da Promotora caso o texto colado no formulário esteja incompleto ou que o acesso não seja viável por erro de digitação pelo Participante.",
      },
      {
        type: "p",
        text: "4.4. Cada participante poderá se inscrever apenas 1 (uma) única vez no concurso, mediante o envio de 1 (uma) única frase em texto vinculada ao seu CPF. Caso sejam identificadas múltiplas inscrições com o mesmo CPF, apenas a primeira submissão válida será considerada para julgamento.",
      },
    ],
  },
  {
    id: "avaliacao",
    title: "5. Critérios de avaliação e seleção",
    blocks: [
      {
        type: "p",
        text: "5.1. Todas as respostas enviadas de acordo com as regras estabelecidas neste regulamento serão avaliadas por uma Comissão Julgadora interna, composta por profissionais de Comunicação, Relacionamento e Meio Ambiente da Fundação Grupo Boticário.",
      },
      {
        type: "p",
        text: "5.2. As submissões serão julgadas de forma individual, sem identificação de autoria pela banca, sob os seguintes critérios:",
      },
      {
        type: "list",
        items: [
          'Adequação ao Tema (Peso 4): Capacidade de responder à pergunta "Como você demonstra a sua paixão pela natureza?", demonstrando conexões genuínas, práticas e criativas com o cuidado e a conservação da biodiversidade.',
          "Criatividade e Originalidade (Peso 4): Grau de inovação na abordagem do tema, uso de metáforas, frescor das ideias.",
          "Clareza de Expressão e Qualidade (Peso 2): Correção gramatical, fluidez, concisão e poder de síntese na construção da frase.",
        ],
      },
      {
        type: "p",
        text: "5.3. As decisões da Comissão Julgadora são soberanas, autônomas, definitivas e irrecorríveis, não cabendo qualquer tipo de recurso ou contestação por parte dos participantes.",
      },
    ],
  },
  {
    id: "premiacao",
    title: "6. Da premiação",
    blocks: [
      {
        type: "p",
        text: "6.1. Serão premiadas as 3 (três) melhores respostas avaliadas pela Comissão Julgadora.",
      },
      {
        type: "p",
        text: "6.2. A premiação será distribuída da seguinte forma:",
      },
      {
        type: "list",
        items: [
          '1º Lugar (Melhor resposta): 01 (uma) camisa exclusiva da campanha "Somos Fãs por Natureza" autografada pelo jogador Kaká (Ricardo Izecson dos Santos Leite).',
          '2º Lugar (Segunda melhor resposta): 01 (uma) camisa exclusiva da campanha "Somos Fãs por Natureza" autografada pelo jogador Kaká (Ricardo Izecson dos Santos Leite).',
          "3º Lugar (Terceira melhor resposta): 01 (um) Kit Exclusivo institucional da Fundação Grupo Boticário (contendo itens promocionais e de conscientização ecológica).",
        ],
      },
      {
        type: "p",
        text: "6.3. O prêmio é pessoal, individual e intransferível, não podendo ser convertido em dinheiro, comercializado ou trocado por qualquer outro item.",
      },
      {
        type: "p",
        text: "6.4. Os vencedores serão contatados diretamente pela organização por e-mail e/ou outros contatos cadastrados no formulário. Os contemplados terão o prazo de até 5 (cinco) dias úteis para responder à comunicação e fornecer os dados de envio postal do prêmio, sob risco de desclassificação e repasse do prêmio para o próximo colocado na lista de classificação da Comissão.",
      },
    ],
  },
  {
    id: "propriedade",
    title: "7. Propriedade intelectual e autorização de uso de imagem",
    blocks: [
      {
        type: "p",
        text: "7.1. Ao enviar a inscrição, o participante declara que a frase submetida é de sua autoria exclusiva, original e inédita, não infringindo direitos de propriedade intelectual ou direitos de imagem de terceiros. O participante assume total e exclusiva responsabilidade por qualquer questionamento judicial ou extrajudicial referente à autoria do material.",
      },
      {
        type: "p",
        text: "7.2. A aceitação deste Regulamento e a participação no Concurso implicam, automaticamente, na cessão gratuita, perpétua, irrevogável e exclusiva de todos os direitos autorais patrimoniais e de imagem sobre as frases enviadas para a Fundação Grupo Boticário de Proteção à Natureza.",
      },
      {
        type: "p",
        text: '7.3. A Fundação poderá utilizar, editar, adaptar, exibir e publicar as frases enviadas em suas redes sociais oficiais (Instagram, TikTok, LinkedIn, YouTube, etc.), sites institucionais, relatórios e outros canais de comunicação, de forma orgânica ou patrocinada, com fins educativos, institucionais e promocionais da campanha "Fãs por Natureza", sem que seja devido qualquer pagamento, remuneração ou indenização ao participante.',
      },
    ],
  },
  {
    id: "lgpd",
    title: "8. Proteção de dados pessoais (LGPD)",
    blocks: [
      {
        type: "p",
        text: "8.1. A Fundação Grupo Boticário, na qualidade de Controladora, tratará os dados pessoais coletados neste Concurso em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/18 - LGPD) e com sua política de privacidade, disponível em: https://fundacaogrupoboticario.org.br/politica-de-privacidade/.",
      },
      {
        type: "p",
        text: "8.2. Os dados fornecidos pelos participantes (Nome, E-mail, Telefone, CPF e Endereço) serão utilizados exclusivamente para os propósitos de operacionalização, fiscalização, validação da identidade, entrega da premiação deste Concurso e inserção do lead qualificado na régua de relacionamento educacional da Fundação.",
      },
      {
        type: "p",
        text: "8.3. Os dados dos participantes não serão compartilhados com terceiros sem autorização prévia, salvo com prestadores de serviço contratados para auxiliar na execução logística da entrega dos prêmios, que também estarão vinculados às obrigações de confidencialidade e proteção de dados.",
      },
    ],
  },
  {
    id: "gerais",
    title: "9. Disposições gerais",
    blocks: [
      {
        type: "p",
        text: "9.1. Este concurso tem caráter estritamente cultural e artístico, promovido nos moldes do art. 3º, inciso II, da Lei nº 5.768/71, combinado com o art. 30 do Decreto nº 70.951/72, não estando vinculado a fatores de sorte, sorteio, pagamento, ou vinculação obrigatória de produtos e marcas do Grupo Boticário.",
      },
      {
        type: "p",
        text: "9.2. Serão automaticamente desclassificados e excluídos do concurso os participantes que apresentarem respostas plagiadas, inapropriadas, ofensivas, que promovam ódio, preconceito, discurso de cunho político/ideológico, ou que de alguma forma descumpram o Código de Conduta do Grupo Boticário.",
      },
      {
        type: "p",
        text: "9.3. Os casos omissos ou as dúvidas não previstas neste Regulamento serão resolvidos soberanamente pela comissão organizadora do Concurso Cultural, cujas decisões serão definitivas.",
      },
      {
        type: "p",
        text: "9.4. Em caso de dúvidas, reclamações ou suporte, o participante poderá entrar em contato com a equipe organizadora da Fundação por meio do e-mail oficial: contato@fundacaogrupoboticario.org.br.",
      },
      {
        type: "p",
        text: "9.5. Fica eleito o Foro da Comarca de Curitiba - PR para dirimir eventuais questões judiciais referentes a este regulamento.",
      },
    ],
  },
];

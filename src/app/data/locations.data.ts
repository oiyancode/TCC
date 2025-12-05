export interface BrazilianState {
  uf: string;
  name: string;
  cities: string[];
}

export const BRAZILIAN_STATES: BrazilianState[] = [
  {
    uf: 'AC',
    name: 'Acre',
    cities: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó']
  },
  {
    uf: 'AL',
    name: 'Alagoas',
    cities: ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo']
  },
  {
    uf: 'AP',
    name: 'Amapá',
    cities: ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão']
  },
  {
    uf: 'AM',
    name: 'Amazonas',
    cities: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari']
  },
  {
    uf: 'BA',
    name: 'Bahia',
    cities: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro', 'Lauro de Freitas']
  },
  {
    uf: 'CE',
    name: 'Ceará',
    cities: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato']
  },
  {
    uf: 'DF',
    name: 'Distrito Federal',
    cities: ['Brasília', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Planaltina']
  },
  {
    uf: 'ES',
    name: 'Espírito Santo',
    cities: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares']
  },
  {
    uf: 'GO',
    name: 'Goiás',
    cities: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás']
  },
  {
    uf: 'MA',
    name: 'Maranhão',
    cities: ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó']
  },
  {
    uf: 'MT',
    name: 'Mato Grosso',
    cities: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra']
  },
  {
    uf: 'MS',
    name: 'Mato Grosso do Sul',
    cities: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã']
  },
  {
    uf: 'MG',
    name: 'Minas Gerais',
    cities: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga']
  },
  {
    uf: 'PA',
    name: 'Pará',
    cities: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal', 'Parauapebas']
  },
  {
    uf: 'PB',
    name: 'Paraíba',
    cities: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux']
  },
  {
    uf: 'PR',
    name: 'Paraná',
    cities: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo']
  },
  {
    uf: 'PE',
    name: 'Pernambuco',
    cities: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho']
  },
  {
    uf: 'PI',
    name: 'Piauí',
    cities: ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano']
  },
  {
    uf: 'RJ',
    name: 'Rio de Janeiro',
    cities: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda']
  },
  {
    uf: 'RN',
    name: 'Rio Grande do Norte',
    cities: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba']
  },
  {
    uf: 'RS',
    name: 'Rio Grande do Sul',
    cities: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande']
  },
  {
    uf: 'RO',
    name: 'Rondônia',
    cities: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal']
  },
  {
    uf: 'RR',
    name: 'Roraima',
    cities: ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí']
  },
  {
    uf: 'SC',
    name: 'Santa Catarina',
    cities: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Jaraguá do Sul', 'Lages']
  },
  {
    uf: 'SP',
    name: 'São Paulo',
    cities: ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'São José dos Campos', 'Ribeirão Preto', 'Sorocaba', 'Santos', 'Mauá', 'São José do Rio Preto', 'Mogi das Cruzes', 'Diadema', 'Jundiaí', 'Piracicaba', 'Carapicuíba', 'Bauru', 'Itaquaquecetuba', 'Franca']
  },
  {
    uf: 'SE',
    name: 'Sergipe',
    cities: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'Estância']
  },
  {
    uf: 'TO',
    name: 'Tocantins',
    cities: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins']
  }
];

export const COUNTRIES = [
  'Brasil',
  'Argentina',
  'Chile',
  'Uruguai',
  'Paraguai',
  'Bolívia',
  'Peru',
  'Colômbia',
  'Venezuela',
  'Equador',
  'Estados Unidos',
  'Canadá',
  'México',
  'Portugal',
  'Espanha',
  'França',
  'Itália',
  'Alemanha',
  'Reino Unido',
  'Japão',
  'China',
  'Coreia do Sul',
  'Austrália'
];

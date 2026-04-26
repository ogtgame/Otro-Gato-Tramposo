const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(express.static(path.join(__dirname, 'public')));

// ── Mazos de cartas ──────────────────────────────────────────────────────────
const BLACK_CARDS = [
"Soy el genio de la lámpara y te concederé tres deseos, ¿cuál es el primero? __________",
"Mis viejos se unieron a una secta nueva que adora __________ .",
"Según la Organización Mundial de la Salud no hay nada más peligroso que __________ .",
"Llegué tarde porque había un piquete a favor de __________ .",
"El problema de la Iglesia es que está controlada por __________ .",
"La nueva pareja del Bailando: __________ y __________ .",
"Mi viejo siempre decía: 'En la mesa no se habla de política ni de __________ '.",
"Todos los días de 20 a 21 me tomo una horita para __________ .",
"Mi vida sexual es comparable a __________ .",
"El mundo sería un mejor lugar sin __________ .",
"Club Atlético __________ .",
"¿Qué es lo peor que te podés tatuar borracho? __________ ",
"El homeópata me recomendó __________ .",
"Lo único que le gusta más a los Pumas que cantar el himno es __________ .",
"Mi libro se va a llamar: __________ , una historia sobre __________ .",
"¿De qué fue testigo Jehová? __________ ",
"Trágico accidente deja 35 heridos. La causa: __________ .",
"Qué ganas de hacer un trío con __________ y __________ .",
"Solo dos cosas pueden lastimar a Superman: la kryptonita y __________ .",
"Nada le gusta tanto a un cura como __________ .",
"El tiburón más grande es el tiburón ballena. Pero el más raro es el tiburón __________ .",
"¿Sabías que el campeón mundial de __________ es argentino?",
"Chanel presenta su nueva fragancia: Obsesión de __________ , eau de toilette.",
"La verdad es que soy un privilegiado, vivo de __________ .",
"Cuando tenía tiempo, en lugar de la Z el Zorro te dibujaba __________ .",
"Por las noches soy un superhéroe conocido como __________ y mi superpoder es __________ .",
"Nos conocimos en una fiesta de disfraces. Se disfrazó de __________ y yo de __________ .",
"De los caballeros de la mesa redonda, el que más me gusta es Sir __________ .",
"Se solicita a los señores pasajeros __________ .",
"Cuando era chico, todos los años le pedía a Papá Noel lo mismo: __________ .",
"El que depositó dólares, recibirá __________ .",
"No se la pude chupar. Tenía gusto a __________ .",
"No hay nada mejor para una primera cita que __________ .",
"El médico me dijo que fue un milagro, pero de ahora en más, nada de __________ .",
"Y el premio __________ es para __________ .",
"El piropo más raro que me dijeron: 'Quisiera ser __________ para __________ con vos'.",
"Piedra, papel o __________ .",
"En el cine están dando __________ III.",
"(Nombrá a un jugador de la mesa) usa el mismo password para todo: __________ .",
"Científicos crearon un robot mitad __________ mitad __________ .",
"Vuelve el boxeo al Luna Park: ' __________ ' Calderón vs. ' __________ ' Salazar.",
"¿Qué tiene que tener tu pareja ideal? __________ . ",
"Plantar un árbol, escribir un libro, __________ .",
"¿Cuál es tu secreto para ser tan sexy? __________ ",
"Lo que más bronca le da a (nombrá a un jugador de la mesa) es: __________ .",
"Lo que más excita a (nombrá a un jugador de la mesa) es __________ .",
"¿Qué cosa es legal pero va a dejar de serlo en 10 años?",
"No sé si es el momento para decirlo, pero ayer (nombrá a un jugador de la mesa) me dijo que tenía pesadillas recurrentes con __________ .",
"—¿Por qué llora Quico? —Por __________ .",
"No te puedo explicar el asco que me da __________ .",
" __________ puso a Argentina en el mapa.",
"Mi pareja me dejó por __________ .",
"No hay nada más triste que __________ .",
"Arqueólogos descubren que los antiguos egipcios amaban __________ .",
"Debo confesarlo, tengo un fetiche con __________ .",
"De pibe tenía el álbun de figuritas de __________ .",
"¿Cuál es el peor regalo que te pueden hacer? __________ ",
"La causa de la Tercera Guerra Mundial va a ser __________ .",
"En el nombre del Padre, del Hijo y de __________ .",
"En lugar de rendir el final tuvimos que preparar una monografía sobre __________ .",
"Donald Trump podrá tener todo el dinero del mundo, pero nunca podrá tener __________ .",
"Soy el heredero al trono. La espada de __________ me pertenece.",
"Hoy en yoga aprendimos tres posturas nuevas. La grulla, el loto y __________ .",
"Elige tu propia aventura: Eres un agente secreto contra __________ .",
"Acabo de terminar de leer una novela erótica sobre __________ .",
"El Comité Olímpico Internacional está analizando sumar __________ a los próximos juegos.",
"Entre mi porno tengo una carpeta entera dedicada a __________ .",
"Se difundió una encuesta que dice que el 71% de los argentinos les gusta __________ .",
"Dios perdona, __________ no.",
"Macri reemplazó los cuadros de la Casa Rosada por cuadros de __________ .",
"El gobierno planea reemplazar el Obelisco con un monumento a __________ .",
"Olmedo y Porcel presentan: A las chicas les gusta __________ .",
"¿Qué guarda Batman en lo más profundo de la Baticueva? __________ ",
"Cada vez hay más gente con fobia a __________ .",
"Informe especial: El lado oscuro de __________ .",
"Todo bien con el colectivo y la birome, pero el mejor invento argentino es por lejos __________ .",
"El Frente para la Victoria tiene a La Cámpora, Cambiemos tiene __________ .",
"¿Quién estuvo detrás del atentado a la AMIA? __________ ",
"Almuerzan hoy con la señora: __________ y __________ .",
"Amo el olor de __________ por la mañana.",
"Solo hay una cosa que me gusta más que coger: __________ .",
"Lo más difícil de ser ciego debe ser __________ .",
"Antes de morir, Nostradamus predijo la llegada de __________ .",
"Soy capaz de tolerar cualquier cosa, excepto __________ .",
"Los ricos comen sushi sobre el cuerpo de una mujer desnuda. Los MUY ricos, sobre __________ .",
"Nada es tan desagradable como masturbarse pensando en __________ .",
"La secuela de Charlie y la fábrica de chocolate debería llamarse Charlie y __________ .",
"#__________ .",
];

const WHITE_CARDS = [
  "Parir en el auto",
  "Preguntarle si está por acabar",
  "Auschwitz",
  "Lágrimas de semen",
  "Tu situación laboral",
  "Una verga más ancha que larga",
  "Orgasmos múltiples",
  "La tira de cola",
  "El negro pijudo del WhatsApp",
  "El carnaval carioca",
  "El trabajo esclavo",
  "Mi ex llorando en el baño",
  "Una fuga de gas en el colectivo",
  "El olor a pies de un amigo",
  "Comer asado sin servilleta",
  "Meter los pies en una pileta fría",
  "Una rata en el subte",
  "Pegarse un pedo en el ascensor",
  "Olvidarse el nombre en pleno sexo",
  "Tu vecina de 70 en bikini",
  "Milanesas de soja",
  "Un cura en cuero",
  "El médico de guardia a las 3am",
  "Nuestros representantes en el Congreso",
  "Un asado sin pan",
  "La resaca del domingo",
  "El boleto de colectivo cortado",
  "Un selfie en un velorio",
  "Choripán con mostaza en los pantalones",
  "El delivery que llegó frío",
  "La cuota del gimnasio que no uso",
  "Trepar un semáforo borracho",
  "Un beso con olor a malbec",
  "Hacerse la paja con wifi ajeno",
  "Hablar con la ex a las 4am",
  "Un perro con corona de flores",
  "Correr el colectivo con ojotas",
  "Llorar viendo Intensamente",
  "Hacerse el dormido en el subte",
  "Dar el número falso en el boliche",
  "La cara de tu jefe cuando llegás tarde",
  "Mandar un audio de 10 minutos",
  "Quedarse sin batería en el remis",
  "Cagar en un baño ajeno",
  "Una torta de cumpleaños con velas de cera en el bizcochuelo",
  "Morirse ahogado en una pileta inflable",
  "Salir en el Zoom en cuero",
  "Confundir el chat del trabajo con el de la novia",
  "Perder los documentos en carnaval",
  "Casarse con la prima segunda",
  "La deuda externa",
  "Los jubilados",
  "El dólar blue",
  "La inflación del 200%",
  "El FMI",
  "Milei en tanga",
  "Cristina bailando cumbia",
  "El Gordo Dan sin filtro",
  "Susana Giménez fumando un faso",
  "Tinelli llorando en vivo",
  "Moria Casán en misa",
  "Nazarena Vélez sin maquillaje",
  "Marcelo Gallardo desnudo en la ducha",
  "Tevez comiendo milanesas",
  "Lio Messi cagando",
  "El Diego resucitado",
  "Tu jefe haciendo OnlyFans",
  "El plomero que nunca viene",
  "La psicóloga que llora más que vos",
  "El médico que te atiende con el celu",
  "El contador que se robó todo",
  "La maestra de tercer grado que olía raro",
  "El vecino que escucha cumbia a las 3am",
  "La señora que ocupa dos asientos",
  "El tipo que no se bañó en el colectivo",
  "La piba que llora en el avión",
  "El pibe que le manda audio al grupo del trabajo",
  "Mi abuela mirando TikTok",
  "Un cura haciendo TikTok",
  "Un abogado honesto",
  "Un político que no roba",
  "Un influencer con talento real",
  "Un vegano callado",
  "Un hincha de fútbol pacífico",
  "Un periodista objetivo",
  "Un taxista que no opina",
  "Un médico que explica bien",
  "Un mecánico que no estafa",
  "Un kiosquero amable",
  "Llorarte encima en el boliche",
  "Dormirte en el casamiento ajeno",
  "Vomitar en un Uber",
  "Confundir a tu suegra con tu mamá",
  "Tirar un pedo justo antes del silencio",
  "Mandarse una paja con el mouse del trabajo",
  "Llorar en el baño de la oficina",
  "Insultar al árbitro frente a tu hijo",
  "Contarle tu trauma al delivery",
  "Hablar solo en el supermercado",
  "Mear en el jardín del vecino",
  "Googlear síntomas a las 2am",
  "Mirar el celu en el velorio",
  "Hacer zapping durante el sexo",
  "Llamar a tu pareja con el nombre del ex",
  "Un volquete lleno de cadáveres",
  "Un bebé de caca",
  "El olor a billete viejo",
  "El padre Grassi",
  "Una paja bolsillera",
  "La cura contra el cáncer",
  "El pibe con el que debutó Pele",
  "Una milanesa de soja",
  "ALF",
  "Un disparo en la cabeza",
  "La selección rusa de volley",
  "Responder un 'te amo' con un 'gracias'",
  "Un Falcon verde",
  "El Viagra",
  "Un mes sin masacres en Estados Unidos",
  "El poliamor",
  "El ex presidente Pinedo",
  "Un antojo de carne humana",
  "Ir a pilates",
  "Un ano contra natura",
  "Un cinturón de castidad",
  "Una guerra de almohadas",
  "Los millennials",
  "El fantasma de la B",
  "Ser mufa",
  "Chuck Norris",
  "La verdad, toda la verdad y nada más que la verdad",
  "Un detector de sarcasmo",
  "Compartir jeringas",
  "El aro del corpiño",
  "El tránsito lento",
  "Mi entrepierna",
  "Dos niñas de 7 años",
  "Un secuestro express",
  "Andar a caballo en pelotas",
  "¡Essssta!",
  "Un hippie con OSDE",
  "Un alto guiso",
  "Poner la otra mejilla",
  "La flora intestinal",
  "Enterarme de que mi vieja es insaciable",
  "Salir de joda los martes",
  "Un disfraz de empanada",
  "Los piojos",
  "Un uruguayo llamado Washington",
  "Enterarme de que su ex la tenía mucho más grande",
  "Un enorme y gigantesco clítoris",
  "Guantánamo",
  "Laburar los findes",
  "Eyacular en gravedad cero",
  "Esperar a que cumpla 18",
  "Donald Trump",
  "Chupar de abajo para arriba",
  "Separar siameses",
  "La Cámara de Diputados",
  "Apoyar el traste en la estufa",
  "Un pingüino empetrolado",
  "Ejercer el derecho de prima nocte con todos mis amigos",
  "Rabas hechas con prepucios",
  "36 vírgenes por un trabajo hecho a medias",
  "Anonymous",
  "La Marcha Peronista",
  "El Dirty Sanchez",
  "Pezones bizcos",
  "Dar el vuelto con caramelos",
  "Entrarle como gallego a la gaita",
  "Hacerle caso a las voces en mi cabeza",
  "El líquido azul de las propagandas de toallitas",
  "Ese festival chino donde comen carne de perro",
  "Forros sabor cordero patagónico",
  "La subtrenmetrocleta",
  "El pibe de Mi pobre angelito",
  "La década ganada",
  "Quebrar en la previa",
  "Un banco de esperma",
  "La Bonaerense",
  "La 12",
  "Imponer socialmente el Día de la Concha",
  "El sex shop al final de la galería",
  "Sentir que me están cagando",
  "Frodo, Sam y los otros dos",
  "Consumir drogas duras",
  "Una bicicleta con dos vergas en lugar de manubrio",
  "Maiameeeee",
  "La navaja de MacGyver",
  "Un mal flash",
  "Cagar al prójimo",
  "La santa Biblia",
  "Larry, Curly y Moe",
  "Irse a vivir al Uritorco",
  "La justicia por mano propia",
  "El testículo del medio",
  "El amor de Viggo Mortensen por San Lorenzo",
  "El Gauchito Gil",
  "Los barones del conurbano",
  "La homofobia",
  "La clase obrera",
  "Fingir el orgasmo",
  "Ponerla",
  "Un sueño húmedo",
  "La gilada",
  "El gol de Diego a los ingleses",
  "Un grupo de viejos fachos",
  "La SIDE",
  "Pobreza digna",
  "El anillo de cuero",
  "Un perrito con ruedas en lugar de patas traseras",
  "El anticristo",
  "Cambiar de género",
  "Un guiso de escrotos",
  "Depilarse el pecho",
  "La pica entre colectiveros y taxistas",
  "La siesta santiagueña",
  "Un masaje de próstata",
  "Los kelpers",
  "Hacerte el orto",
  "El tipo con el que fantasea tu vieja",
  "Los piqueteros",
  "Tener cara de boludo",
  "Una fuerte tendencia a la necrofilia",
  "El hijo de puta que se está cogiendo al amor de tu vida mientras vos estás jugando a esto",
  "El negro que muere primero en las películas",
  "Un señor desnudo llorando en la calle",
  "Un Pollock de caca",
  "Viajar en la línea Sarmiento",
  "Dos semanas de retraso",
  "Oler la ropa interior de tu vieja",
  "Los niños rata",
  "Mi colección de rosarios anales",
  "Un volcán de semen",
  "La asfixia erótica",
  "Salir del clóset",
  "Un culo peludo",
  "El gigoló de Rosario",
  "Diciembre de 2001",
  "La celulitis",
  "Las invasiones bárbaras",
  "Los fluidos vaginales",
  "El tipo que piensa las placas de Crónica",
  "La del mono",
  "Aguantar los trapos",
  "Pinchar forros",
  "Sacar los pelos de la rejilla del baño",
  "Borrar una publicación porque nadie le dio like",
  "Cenar atún directo de la lata",
  "Un supositorio",
  "Meter los cuernos",
  "La fiesta",
  "Hacer cucharita con Hitler",
  "Tu vieja",
  "El espiral para los mosquitos",
  "El tráfico de órganos",
  "La infertilidad",
  "El paco",
  "Un niño africano y su AK-47",
  "Amar animales más de lo que alguien debería amar un animal",
  "Las islas Malvinas",
  "El racismo",
  "El sadomasoquismo",
  "Rosa, la maravillosa",
  "La fe cristiana",
  "Un payaso",
  "El chi chi chi le le le",
  "Un ginecólogo pediatra",
  "No tener códigos",
  "Ese tío raro que tienen todas las familias",
  "Las anécdotas de mi viejo",
  "Malos modales",
  "Una inerte barra de carbón",
  "La fiesta de la espuma",
  "Un proctólogo",
  "La bipolaridad",
  "Instalar la monarquía en la Argentina",
  "Una denuncia de Carrió",
  "Ponerle pasas de uva a las empanadas",
  "Creer en el horóscopo",
  "La zona roja",
  "El vértigo en la cola",
  "Stalkear a tu ex en redes sociales",
  "La adicción al sexo",
  "El acoso sexual en el subte",
  "Fosas comunes",
  "El gluten",
  "Mi hermano",
  "La versión braille del Kamasutra",
  "Algún pelotudo de la farándula al azar",
  "Ir a misa",
  "La pena de muerte",
  "Sacarla y acabar afuera",
  "Un cinturonga",
  "Los mormones",
  "Un ataque de palometas",
  "Irse en seco",
  "Adolf Hitler",
  "Un poster de la concha de tu hermana",
  "Un tuca",
  "Un super chino",
  "Agacharse y conocerlo",
  "Las inundaciones",
  "El segundo cordón del conurbano bonaerense",
  "El cuco",
  "El fundamentalismo vegano",
  "Probar con un yogur",
  "La cara de Cristiano cuando le dan un premio a Messi",
  "La computadorita por la que habla Stephen Hawking",
  "Revisarle el celu a tu pareja",
  "Mi jefe",
  "Un enema",
  "Un metrodelegado",
  "La Deep Web",
  "Jugar al Jenga con un sobreviviente de las Torres Gemelas",
  "La esvástica",
  "Un frasquito con un feto adentro",
  "Una foto mía de hace 5 años",
  "Las manos de todos los pibes arriba",
  "La raza aria",
  "Un harén de cholas peruanas",
  "Ponerse la gorra",
  "Las manos de Perón",
  "Una lluvia de pijas",
  "Lo que queda del radicalismo",
  "Querer que vuelvan los militares",
  "Tomar medio vasito de orina",
  "Un video de ISIS decapitando periodistas",
  "La Tercera Guerra Mundial",
  "Tener las bolas por el piso",
  "Un dildo de dos puntas",
  "Vivir rodeado de pelotudos",
  "Los skinheads",
  "Las hemorroides",
  "Hacer molinete",
  "Coger con extraños",
  "Un arquero paraguayo con el ego altísimo",
  "Matilda",
  "La pincita de la depiladora",
  "El Dalai Lama",
  "El amor",
  "Opinar sin saber",
  "El calentamiento global",
  "La discriminación",
  "La eutanasia",
  "La mafia china",
  "Herpes bucales",
  "Llegar virgen al matrimonio",
  "La Difunta Correa",
  "Jesús",
  "El Día de la Lealtad",
  "Salpicar la tapa del inodoro",
  "La posibilidad de una guerra nuclear",
  "El cavado profundo",
  "Un brote de dengue",
  "La que hace la traducción para sordomudos",
  "Un conchero",
  "El Ku Klux Klan",
  "La servidumbre",
  "(Nombrá al jugador de tu derecha)",
  "Una MILF",
  "El autor intelectual del crimen de Cabezas",
  "Los pelirrojos",
  "Rambo",
  "Un motochorro",
  "El antidóping",
  "Un chiste misógino",
  "Darle para que tenga",
  "El olor a bebé",
  "El culto al crossfit",
  "Legalizar el aborto",
  "Una wacha piola",
  "El sueño de ser campeón de Gimnasia",
  "Una bañera llena de tibia leche",
  "Los porteños",
  "Una salidera bancaria",
  "El pibe de sistemas",
  "El incesto",
  "La cárcel de Devoto",
  "Un puñal de carne",
  "El machismo",
  "Negar el Holocausto",
  "ISIS",
  "El rigor mortis",
  "El colesterol alto",
  "Los ensayos nucleares de Corea del Norte",
  "Lamer axilas",
  "Tapar el baño",
  "El 70% de descuento en la segunda unidad",
  "La pubertad",
  "La leche cortada",
  "La barba candado",
  "Vladimir Putin",
  "La AFIP",
  "Automedicarse",
  "Quedarse pelado",
  "Una tirada de goma decepcionante",
  "La pulserita roja contra la envidia",
  "Un deportista argentino en una final",
  "El Opus Dei",
  "Una mujer con los pies muy pequeños y el pene muy grande",
  "Un pedo vaginal",
  "Jugar al teto",
  "La concha de la lora",
  "Cerrar el orto",
  "Los pañales para adultos",
  "Recuerdos reprimidos",
  "La copa menstrual",
  "La pastilla del día después",
  "Un culo come trapo",
  "La ira de Dios",
  "La carpita mañanera",
  "El pueblo judío",
  "El papa Francisco",
  "Una jauría de lobos salvajes",
  "Eructar el abecedario",
  "Sergio Massa",
  "Mauricio Macri",
  "Esa tibia sensación que sentís cuando levantás la caca del perro con una bolsita",
  "Brownies con gusto a pasto",
  "La Iglesia maradoniana",
  "Una silla de ruedas",
  "Un test de embarazo positivo",
  "La flacidez",
  "Un accidente en un parque de diversiones",
  "Matar al último panda",
  "El porno gay",
  "Las bicisendas",
  "Mirar nenas en jumper",
  "(Nombrá al jugador de tu izquierda)",
  "La cumbia villera",
  "Coger con cocaína en la punta de la verga",
  "Usar sandalias con medias",
  "Un cabeza de termo",
  "La muerte",
];

// ── Expansiones ──────────────────────────────────────────────────────────────

// ══════ EXPANSIÓN 1: NO SE HABLA DE POLÍTICA 👺 ══════
const EXP1_BLACK = [
  // PEGÁ ACÁ TUS 15 CARTAS NEGRAS
  // Ejemplo: "El próximo presidente va a resolver todo con __________",
];
const EXP1_WHITE = [
  // PEGÁ ACÁ TUS 35 CARTAS BLANCAS
  // Ejemplo: "Un decreto de necesidad y urgencia",
];

// ══════ EXPANSIÓN 2: EL QUE ESCOGE NO COGE 😏 ══════
const EXP2_BLACK = [
  // PEGÁ ACÁ TUS 15 CARTAS NEGRAS
];
const EXP2_WHITE = [
  // PEGÁ ACÁ TUS 35 CARTAS BLANCAS
];

// ══════ EXPANSIÓN 3: EN EL NOMBRE DEL PADRE ⛪ ══════
const EXP3_BLACK = [
  // PEGÁ ACÁ TUS 15 CARTAS NEGRAS
];
const EXP3_WHITE = [
  // PEGÁ ACÁ TUS 35 CARTAS BLANCAS
];

const EXPANSIONS = {
  1: { black: EXP1_BLACK, white: EXP1_WHITE },
  2: { black: EXP2_BLACK, white: EXP2_WHITE },
  3: { black: EXP3_BLACK, white: EXP3_WHITE },
};

function buildDecks(expansions) {
  let blacks = [...BLACK_CARDS];
  let whites = [...WHITE_CARDS];
  if (Array.isArray(expansions)) {
    expansions.forEach(id => {
      const exp = EXPANSIONS[id];
      if (exp) {
        blacks = blacks.concat(exp.black.filter(c => c));
        whites = whites.concat(exp.white.filter(c => c));
      }
    });
  }
  return { blacks: shuffle(blacks), whites: shuffle(whites) };
}

// ── Estado de salas ──────────────────────────────────────────────────────────
const rooms = {};
const TURN_TIMEOUT = 60; // segundos

function generateRoomCode() {
  return crypto.randomBytes(2).toString('hex').toUpperCase();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function countBlanks(text) {
  return (text.match(/__________/g) || []).length;
}

function createRoom(hostId, hostName, targetScore, maxPlayers, expansions) {
  const code = generateRoomCode();
  const { blacks, whites } = buildDecks(expansions);
  rooms[code] = {
    code,
    phase: 'lobby',
    hostId,
    players: [{ id: hostId, name: hostName, score: 0, hand: [], isJudge: false }],
    blackDeck: blacks,
    whiteDeck: whites,
    currentBlackCard: null,
    submissions: [],
    shuffledSubmissions: [],
    roundWinner: null,
    targetScore: targetScore || 7,
    maxPlayers: maxPlayers || 8,
    expansions: expansions || [],
    judgeIndex: 0,
    roundNumber: 0,
    disconnectedPlayers: {},
    turnTimer: null,
    turnStartedAt: null,
  };
  return code;
}

function getRoom(code) {
  return rooms[code] || null;
}

function dealCards(room) {
  room.players.forEach(p => {
    while (p.hand.length < 10) {
      if (room.whiteDeck.length === 0) {
        room.whiteDeck = shuffle(WHITE_CARDS);
      }
      p.hand.push(room.whiteDeck.pop());
    }
  });
}

// ── Timer automático ─────────────────────────────────────────────────────────
function clearTurnTimer(room) {
  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }
  room.turnStartedAt = null;
}

function startTurnTimer(room) {
  clearTurnTimer(room);
  room.turnStartedAt = Date.now();

  room.turnTimer = setTimeout(() => {
    if (!rooms[room.code]) return; // sala ya no existe

    if (room.phase === 'playing') {
      // Auto-enviar carta al azar para jugadores que no enviaron
      const nonJudge = room.players.filter(p => !p.isJudge);
      nonJudge.forEach(p => {
        const alreadySubmitted = room.submissions.find(s => s.playerId === p.id);
        if (!alreadySubmitted && p.hand.length > 0) {
          const blanks = room.currentBlackCard.blanks;
          const cards = [];
          const handCopy = [...p.hand];
          for (let i = 0; i < blanks && handCopy.length > 0; i++) {
            const idx = Math.floor(Math.random() * handCopy.length);
            cards.push(handCopy.splice(idx, 1)[0]);
          }
          // Quitar del hand real
          cards.forEach(card => {
            const idx = p.hand.indexOf(card);
            if (idx !== -1) p.hand.splice(idx, 1);
          });
          room.submissions.push({ playerId: p.id, playerName: p.name, cards, autoSubmitted: true });
        }
      });

      // Pasar a judging
      room.shuffledSubmissions = shuffle(
        room.submissions.map((s, i) => ({ id: i, cards: s.cards }))
      );
      room.phase = 'judging';
      broadcastState(room);
      // Iniciar timer para el juez
      startTurnTimer(room);

    } else if (room.phase === 'judging') {
      // Auto-elegir respuesta al azar
      if (room.shuffledSubmissions.length > 0) {
        const randIdx = Math.floor(Math.random() * room.shuffledSubmissions.length);
        const submission = room.shuffledSubmissions[randIdx];
        const realSub = room.submissions[submission.id];
        const winner = room.players.find(p => p.id === realSub.playerId);

        if (winner) {
          winner.score += 1;
          room.roundWinner = { playerName: winner.name, cards: realSub.cards };
          room.phase = winner.score >= room.targetScore ? 'game_over' : 'round_result';
          room.judgeIndex = (room.judgeIndex + 1) % room.players.length;
          broadcastState(room);
        }
      }
    }

    room.turnTimer = null;
  }, TURN_TIMEOUT * 1000);
}

function startRound(room) {
  clearTurnTimer(room);
  room.phase = 'playing';
  room.submissions = [];
  room.shuffledSubmissions = [];
  room.roundWinner = null;
  room.roundNumber += 1;

  const activePlayers = room.players;
  room.judgeIndex = room.judgeIndex % activePlayers.length;
  activePlayers.forEach((p, i) => { p.isJudge = (i === room.judgeIndex); });

  if (room.blackDeck.length === 0) room.blackDeck = shuffle(BLACK_CARDS);
  const cardText = room.blackDeck.pop();
  room.currentBlackCard = { text: cardText, blanks: countBlanks(cardText) };

  dealCards(room);
  startTurnTimer(room);
}

// ── Estado para cada jugador ──────────────────────────────────────────────────
function getStateForPlayer(room, playerId) {
  const player = room.players.find(p => p.id === playerId);
  const others = room.players.map(p => ({
    id: p.id,
    name: p.name,
    score: p.score,
    isJudge: p.isJudge,
    isHost: p.id === room.hostId,
    hasSubmitted: room.submissions.some(s => s.playerId === p.id),
  }));

  // Tiempo restante del timer
  let timerSecondsLeft = TURN_TIMEOUT;
  if (room.turnStartedAt) {
    const elapsed = Math.floor((Date.now() - room.turnStartedAt) / 1000);
    timerSecondsLeft = Math.max(0, TURN_TIMEOUT - elapsed);
  }

  const base = {
    code: room.code,
    phase: room.phase,
    players: others,
    currentBlackCard: room.currentBlackCard,
    targetScore: room.targetScore,
    maxPlayers: room.maxPlayers,
    roundNumber: room.roundNumber,
    playerId,
    isHost: playerId === room.hostId,
    isJudge: player ? player.isJudge : false,
    hand: player ? player.hand : [],
    submissionsCount: room.submissions.length,
    totalPlayers: room.players.length,
    timerSecondsLeft,
  };

  if (room.phase === 'judging' || room.phase === 'round_result') {
    base.shuffledSubmissions = room.shuffledSubmissions;
  }

  if (room.phase === 'round_result') {
    base.roundWinner = room.roundWinner;
  }

  if (room.phase === 'game_over') {
    base.roundWinner = room.roundWinner;
    base.winner = room.players.reduce((a, b) => a.score > b.score ? a : b);
    base.finalRanking = [...room.players].sort((a, b) => b.score - a.score)
      .map(p => ({ name: p.name, score: p.score }));
  }

  return base;
}

function broadcastState(room) {
  room.players.forEach(p => {
    const sock = io.sockets.sockets.get(p.id);
    if (sock) sock.emit('game_state', getStateForPlayer(room, p.id));
  });
}

// ── Socket Events ─────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('create_room', ({ playerName, targetScore, maxPlayers, expansions }) => {
    if (!playerName || !playerName.trim()) {
      return socket.emit('error', { message: 'Nombre inválido' });
    }
    const code = createRoom(
      socket.id,
      playerName.trim(),
      targetScore,
      maxPlayers,
      expansions
    );
    socket.join(code);
    socket.emit('room_created', { code });
    broadcastState(rooms[code]);
  });

  socket.on('join_room', ({ roomCode, playerName }) => {
    const room = getRoom(roomCode);
    if (!room) {
      return socket.emit('error', { message: 'Sala no encontrada' });
    }

    if (room.phase !== 'lobby') {
      // Permitir reconexión por nombre
      const disconnected = room.disconnectedPlayers[playerName];
      if (disconnected) {
        const player = room.players.find(p => p.name === playerName);
        if (player) {
          const oldId = player.id;
          player.id = socket.id;
          if (room.hostId === oldId) room.hostId = socket.id;
          delete room.disconnectedPlayers[playerName];
          socket.join(roomCode);
          socket.emit('room_joined', { code: roomCode });
          broadcastState(room);
          return;
        }
      }
      return socket.emit('error', { message: 'La partida ya comenzó' });
    }

    if (room.players.length >= room.maxPlayers) {
      return socket.emit('error', { message: `La sala está llena (máximo ${room.maxPlayers})` });
    }

    if (room.players.find(p => p.name === playerName.trim())) {
      return socket.emit('error', { message: 'Ese nombre ya está en uso' });
    }

    room.players.push({
      id: socket.id,
      name: playerName.trim(),
      score: 0,
      hand: [],
      isJudge: false,
    });
    socket.join(roomCode);
    socket.emit('room_joined', { code: roomCode });
    broadcastState(room);
  });

  socket.on('start_game', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 2) {
      return socket.emit('error', { message: 'Se necesitan al menos 2 jugadores' });
    }
    startRound(room);
    broadcastState(room);
  });

  socket.on('submit_cards', ({ roomCode, cards }) => {
    const room = getRoom(roomCode);
    if (!room || room.phase !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.isJudge) return;
    if (room.submissions.find(s => s.playerId === socket.id)) return;

    const blanks = room.currentBlackCard.blanks;
    if (!Array.isArray(cards) || cards.length !== blanks) {
      return socket.emit('error', { message: `Debes enviar exactamente ${blanks} carta(s)` });
    }

    for (const card of cards) {
      if (!player.hand.includes(card)) {
        return socket.emit('error', { message: 'Carta inválida' });
      }
    }

    cards.forEach(card => {
      const idx = player.hand.indexOf(card);
      if (idx !== -1) player.hand.splice(idx, 1);
    });

    room.submissions.push({ playerId: socket.id, playerName: player.name, cards });

    const nonJudge = room.players.filter(p => !p.isJudge);
    if (room.submissions.length >= nonJudge.length) {
      room.shuffledSubmissions = shuffle(
        room.submissions.map((s, i) => ({ id: i, cards: s.cards }))
      );
      room.phase = 'judging';
      // Reiniciar timer para la fase de judging
      startTurnTimer(room);
    }

    broadcastState(room);
  });

  socket.on('judge_pick', ({ roomCode, submissionId }) => {
    const room = getRoom(roomCode);
    if (!room || room.phase !== 'judging') return;

    const judge = room.players.find(p => p.id === socket.id);
    if (!judge || !judge.isJudge) return;

    const submission = room.shuffledSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    clearTurnTimer(room);

    const realSub = room.submissions[submission.id];
    const winner = room.players.find(p => p.id === realSub.playerId);
    if (!winner) return;

    winner.score += 1;
    room.roundWinner = { playerName: winner.name, cards: realSub.cards };
    room.phase = winner.score >= room.targetScore ? 'game_over' : 'round_result';
    room.judgeIndex = (room.judgeIndex + 1) % room.players.length;

    broadcastState(room);
  });

  socket.on('next_round', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room || room.phase !== 'round_result') return;
    if (room.hostId !== socket.id) return;
    startRound(room);
    broadcastState(room);
  });

  socket.on('restart_game', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    clearTurnTimer(room);
    const { blacks, whites } = buildDecks(room.expansions);
    room.phase = 'lobby';
    room.players.forEach(p => { p.score = 0; p.hand = []; p.isJudge = false; });
    room.blackDeck = blacks;
    room.whiteDeck = whites;
    room.currentBlackCard = null;
    room.submissions = [];
    room.shuffledSubmissions = [];
    room.roundWinner = null;
    room.roundNumber = 0;
    room.judgeIndex = 0;
    broadcastState(room);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
    for (const code in rooms) {
      const room = rooms[code];
      const player = room.players.find(p => p.id === socket.id);
      if (!player) continue;

      if (room.phase === 'lobby') {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.hostId === socket.id && room.players.length > 0) {
          room.hostId = room.players[0].id;
        }
        if (room.players.length === 0) {
          clearTurnTimer(room);
          delete rooms[code];
        } else {
          broadcastState(room);
        }
      } else {
        // Guardar como desconectado para reconexión
        room.disconnectedPlayers[player.name] = socket.id;

        // Bug 3 fix: si se desconecta durante playing sin haber enviado carta,
        // verificar si los demás jugadores conectados ya submitieron para no trabar el juego
        if (room.phase === 'playing') {
          const connectedNonJudge = room.players.filter(p =>
            !p.isJudge && !room.disconnectedPlayers[p.name]
          );
          const allConnectedSubmitted = connectedNonJudge.length > 0 &&
            connectedNonJudge.every(p => room.submissions.find(s => s.playerId === p.id));

          if (allConnectedSubmitted) {
            // Auto-submitir carta al desconectado y pasar a judging
            if (!room.submissions.find(s => s.playerId === player.id) && player.hand.length > 0) {
              const blanks = room.currentBlackCard.blanks;
              const cards = [];
              const handCopy = [...player.hand];
              for (let i = 0; i < blanks && handCopy.length > 0; i++) {
                const idx = Math.floor(Math.random() * handCopy.length);
                cards.push(handCopy.splice(idx, 1)[0]);
              }
              cards.forEach(card => {
                const idx = player.hand.indexOf(card);
                if (idx !== -1) player.hand.splice(idx, 1);
              });
              room.submissions.push({ playerId: player.id, playerName: player.name, cards, autoSubmitted: true });
            }
            room.shuffledSubmissions = shuffle(
              room.submissions.map((s, i) => ({ id: i, cards: s.cards }))
            );
            room.phase = 'judging';
            startTurnTimer(room);
          }
        }

        broadcastState(room);
      }
      break;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`O.G.T. server corriendo en puerto ${PORT}`);
});

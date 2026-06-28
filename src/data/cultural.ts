export interface DestinationInfo {
  image: string
  facts: { title: string; text: string }[]
}

export const DESTINATION_INFO: Record<string, DestinationInfo> = {
  'Bari': {
    image: '/images/destinations/bari.jpg',
    facts: [
      { title: 'Orecchiette', text: 'En el Arco Basso, las señoras del barrio hacen orecchiette a mano en las escaleras de sus casas. Es una tradición de siglos que sigue viva.' },
      { title: 'San Nicola', text: 'Las reliquias de San Nicolás —el original Santa Claus— descansan en Bari desde 1087, traídas desde Mira, Turquía, por marineros barianos.' },
    ],
  },
  'Monopoli': {
    image: '/images/destinations/monopoli.jpg',
    facts: [
      { title: 'Puerto milenario', text: 'El Porto Antico de Monopoli fue uno de los puertos más activos del Adriático durante la Edad Media, con conexiones comerciales hasta el Imperio Otomano.' },
      { title: 'Bastioni', text: 'Las murallas que rodean la ciudad fueron construidas por Carlos V de España en el siglo XVI para defenderse de los ataques turcos.' },
    ],
  },
  'Matera · Alberobello': {
    image: '/images/destinations/matera-alberobello.jpg',
    facts: [
      { title: 'La ciudad más antigua', text: 'Matera es una de las ciudades habitadas más antiguas del mundo, con asentamientos que datan del Paleolítico, hace más de 9.000 años.' },
      { title: 'Los Sassi', text: 'Los Sassi son viviendas excavadas en la roca que se usaron sin interrupción hasta 1950, cuando el gobierno italiano desalojó a sus 15.000 habitantes por considerarlas indignas.' },
      { title: 'Trulli', text: 'Los trulli de Alberobello son construcciones de piedra sin mortero del siglo XIV. Según la leyenda, se construían sin mortero para poder derribarlos rápidamente y evitar impuestos al rey.' },
    ],
  },
  'Valle de Itria': {
    image: '/images/destinations/valle-de-itria.jpg',
    facts: [
      { title: 'Polignano a Mare', text: 'El cantante italiano Domenico Modugno, creador de "Volare", nació en Polignano a Mare. Hay una estatua suya en el mirador principal.' },
      { title: 'Ostuni blanca', text: 'Ostuni se llama "La Città Bianca" porque todas las casas del centro histórico están pintadas de cal blanca, una tradición que empezó en el siglo XV para combatir la peste.' },
    ],
  },
  'Embarque': {
    image: '/images/destinations/embarque.avif',
    facts: [
      { title: 'El Adriático', text: 'El Mar Adriático tiene solo 170 metros de profundidad máxima, lo que lo hace uno de los mares más calmados del Mediterráneo. Ideal para un primer crucero.' },
    ],
  },
  'A bordo': {
    image: '/images/destinations/a-bordo.webp',
    facts: [
      { title: 'Vida a bordo', text: 'Los cruceros modernos tienen más empleados que pasajeros. Por cada 2-3 pasajeros hay un miembro de la tripulación trabajando para que todo funcione.' },
    ],
  },
  'Santorini': {
    image: '/images/destinations/santorini.jpg',
    facts: [
      { title: 'La caldera', text: 'Santorini es el cráter de un supervolcán que explotó hace 3.600 años en una de las erupciones más grandes de la historia. La explosión posiblemente inspiró el mito de la Atlántida.' },
      { title: 'Cúpulas azules', text: 'Las famosas cúpulas azules de Oia son solo 7 en todo el pueblo. El azul representaba el cielo y el mar, y se creía que ahuyentaba a los espíritus malignos.' },
    ],
  },
  'Atenas': {
    image: '/images/destinations/atenas.webp',
    facts: [
      { title: 'La Acrópolis', text: 'El Partenón tardó solo 15 años en construirse (447-432 a.C.), usando más de 100.000 toneladas de mármol del Monte Pentélico. Sus columnas no son perfectamente rectas —tienen una leve curvatura para parecer rectas al ojo humano.' },
      { title: 'Democracia', text: 'Atenas inventó la democracia en el siglo V a.C. Todos los ciudadanos votaban directamente en la Asamblea. El problema: solo eran ciudadanos los hombres libres adultos, excluyendo mujeres, esclavos y extranjeros.' },
    ],
  },
  'Katakolo': {
    image: '/images/destinations/katakolo.jpg',
    facts: [
      { title: 'Los Juegos Olímpicos', text: 'Los primeros Juegos Olímpicos registrados se celebraron en Olimpia en el 776 a.C. Duraban 5 días e incluían carreras, lucha, lanzamiento de disco y carrera de carros.' },
      { title: 'La Llama Olímpica', text: 'La antorcha olímpica moderna se enciende aquí, en el Templo de Hera en Olimpia, usando un espejo parabólico y la luz del sol. Desde 1936 se lleva a la ciudad sede de los juegos.' },
    ],
  },
  'Cefalonia': {
    image: '/images/destinations/cefalonia.jpg',
    facts: [
      { title: 'Melissani', text: 'La cueva de Melissani tiene un lago subterráneo donde el agua parece cambiar de color entre azul y turquesa según la hora del día. En verano, el sol entra por el agujero del techo y el efecto es mágico.' },
      { title: 'Caretta caretta', text: 'Las tortugas bobas (Caretta caretta) anidan en las playas de Cefalonia desde hace millones de años. El puerto de Argostoli es famoso porque las tortugas vienen a buscar comida entre los botes pesqueros.' },
    ],
  },
  'Corfú': {
    image: '/images/destinations/corfu.jpg',
    facts: [
      { title: 'Influencia veneciana', text: 'Corfú estuvo bajo dominio veneciano durante 400 años (1386-1797). Por eso su arquitectura parece Italia: balcones, callejones estrechos y la plaza Spianada, modelada sobre la Plaza de San Marcos de Venecia.' },
      { title: 'Cricket', text: 'Los corfiotes juegan cricket, un deporte que los ingleses introdujeron en el siglo XIX cuando controlaron la isla. Es el único lugar de Grecia donde se juega este deporte.' },
    ],
  },
  'Regreso a Bari': {
    image: '/images/destinations/regreso-a-bari.jpg',
    facts: [
      { title: 'Fin del viaje', text: 'Recorrieron más de 2.500 km por el Mediterráneo, visitaron 3 países y descubrieron lugares que tienen miles de años de historia. No está mal para unas vacaciones.' },
    ],
  },
}

export function getDestinationInfo(destination: string): DestinationInfo | null {
  return DESTINATION_INFO[destination] ?? null
}

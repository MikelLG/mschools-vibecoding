export const EIX_CONTEXT: Record<string, string> = {
  'Benestar social': `L'app s'emmarca en el benestar social i emocional de la comunitat educativa.
Ha de promoure un clima positiu, la gestió emocional i les relacions saludables.
El to ha de ser càlid, empàtic i accessible. Evitar llenguatge tècnic o fred.
Els continguts han de normalitzar les emocions i fomentar l'autoconeixement.`,

  'Educació mediàtica': `L'app s'emmarca en l'educació mediàtica i l'alfabetització digital crítica.
Ha de fomentar el pensament crític davant la informació, les imatges i els missatges digitals.
El to ha de ser analític però accessible. Pot incloure exemples de mitjans reals.
Ha d'ajudar a distingir fonts fiables, detectar biaixos i entendre com funcionen els algoritmes.`,

  'Consciència social': `L'app s'emmarca en la consciència social i la responsabilitat col·lectiva.
Ha de connectar l'aprenentatge amb reptes reals del món: medi ambient, desigualtat, ciutadania.
El to ha de ser compromès però no dogmàtic. Fomentar la reflexió i l'acció.
Pot incloure dades reals, notícies o situacions del context proper de l'alumnat.`,

  'Art i creativitat': `L'app s'emmarca en l'expressió artística i el pensament creatiu.
Ha de donar espai a la imaginació, l'experimentació i la producció creativa.
El disseny visual és especialment important: ha de ser estèticament inspirador.
Pot incloure elements visuals, colors vius, tipografies expressives i espai per a la creació lliure.`,

  'Equitat i inclusió': `L'app s'emmarca en l'equitat i la inclusió educativa.
Ha de ser accessible per a tot l'alumnat, independentment de les seves capacitats o origen.
El llenguatge ha de ser clar, senzill i inclusiu. Evitar estereotips i usar exemples diversos.
Ha de contemplar adaptacions, suports visuals i opcions de personalització sempre que sigui possible.`,

  'Cultura i diversitat': `L'app s'emmarca en la cultura i la diversitat com a riquesa.
Ha de valorar i visibilitzar la diversitat cultural, lingüística i d'identitats.
El to ha de ser respectuós, curiós i celebratori de les diferències.
Pot incloure referents culturals diversos, evitant la centralitat d'una sola cultura.`,
};

export const USUARI_CONTEXT: Record<string, string> = {
  'Docents': `L'usuari és un/a docent d'educació primària, secundària o cicles formatius.
Té competència digital mitjana. Prefereix apps intuïtives que no requereixin formació prèvia.
L'usarà principalment a l'aula o en preparació de classes, amb poc temps disponible.
La interfície ha de ser eficient: poques accions per arribar al resultat.
Ha de funcionar bé en un ordinador de sobretaula o portàtil.
Pot necessitar imprimir o compartir el resultat amb alumnes o famílies.`,

  'Alumnes': `L'usuari és alumnat d'entre 6 i 18 anys (adaptar la complexitat al context descrit).
La interfície ha de ser visual, motivadora i fàcil d'usar sense instruccions prèvies.
Ha de funcionar bé en tauleta o mòbil, a més d'ordinador.
El text ha de ser llegible (mida gran), amb suport visual (icones, colors, il·lustracions).
Ha d'incloure retroalimentació immediata i positiva quan l'usuari interactuï.
Evitar formularis llargs o textos densos. Preferir accions curtes i resultats visibles.`,

  'Famílies': `L'usuari és una família (pare, mare o tutor/a) amb nivell de competència digital variable.
Ha de ser extremadament intuïtiva: sense registre, sense instruccions, sense errors.
El to ha de ser proper, tranquil·litzador i clar. Evitar jergues educatives.
Ha de funcionar perfectament en mòbil (és el dispositiu principal de les famílies).
La informació ha de ser concisa i accionable: "Heu de fer X" o "El vostre fill/a ha fet Y".
Pot incloure notificacions, recordatoris visuals o passos molt simples.`,

  // Legacy aliases
  'Docent': `L'usuari és un/a docent d'educació primària, secundària o cicles formatius.
Té competència digital mitjana. Prefereix apps intuïtives que no requereixin formació prèvia.
L'usarà principalment a l'aula o en preparació de classes, amb poc temps disponible.
La interfície ha de ser eficient: poques accions per arribar al resultat.`,
  'Alumnat': `L'usuari és alumnat d'entre 6 i 18 anys (adaptar la complexitat al context descrit).
La interfície ha de ser visual, motivadora i fàcil d'usar sense instruccions prèvies.
Ha de funcionar bé en tauleta o mòbil, a més d'ordinador.`,
};

export const REPTE_CONTEXT: Record<string, string> = {
  // Docent
  'Gestió d\'aula': `El docent necessita una eina per gestionar la dinàmica del grup a l'aula en temps real.
Contextos habituals: regular el soroll, gestionar torns de paraula, crear grups de treball, assignar rols, controlar el temps d'activitat, registrar participació.
L'app ha de ser usable mentre el docent fa classe, sense interrupcions.`,

  'Organització del temps': `El docent necessita planificar i fer seguiment del temps dins de la sessió o la setmana.
Contextos habituals: temporitzadors d'activitat, distribució de la sessió en blocs, recordatoris de canvi d'activitat, planificació setmanal visual.
Ha de ser simple i visible des de qualsevol punt de l'aula (pantalla gran o ordinador).`,

  'Comunicació amb famílies': `El docent necessita comunicar-se de forma clara i eficient amb les famílies.
Contextos habituals: redactar missatges, preparar reunions, enviar comunicats, registrar incidències, fer seguiment d'alumnes específics.
El to dels textos generats ha de ser professional però proper.`,

  'Preparació de classes': `El docent necessita preparar materials, activitats o recursos per a una sessió concreta.
Contextos habituals: generar exercicis, crear fitxes, dissenyar activitats interactives, preparar preguntes de debat, adaptar contingut per a nivells diferents.
El resultat ha de ser directament usable a l'aula, sense edició addicional.`,

  'Seguiment de l\'alumnat': `El docent necessita fer seguiment del progrés individual o grupal de l'alumnat.
Contextos habituals: registre d'assistència, seguiment d'entregues, alertes d'alumnes en risc, evolució de notes, comunicació amb orientació.
Ha de permetre visualitzar el grup d'un cop d'ull i detectar situacions que necessiten atenció.`,

  'Avaluació': `El docent necessita avaluar l'aprenentatge de l'alumnat de forma justa i significativa.
Contextos habituals: rúbriques, autoavaluació, coavaluació, registre de notes, feedback personalitzat, portfolis digitals, proves formatives.
Ha de poder adaptar-se a criteris d'avaluació competencial.`,

  'Benestar del grup': `El docent necessita cuidar el clima emocional i el benestar del grup classe.
Contextos habituals: activitats de regulació emocional, dinàmiques de cohesió, detecció precoç de malestar, cercles de diàleg, tutoria emocional.
El to ha de ser càlid i no intrusiu. L'app ha de sentir-se com un espai segur.`,

  'Inclusió i accessibilitat': `El docent necessita adaptar el seu ensenyament per incloure alumnat amb necessitats específiques.
Contextos habituals: adaptació de materials, suports visuals, instruccions simplificades, materials en format àudio, adaptació d'avaluacions, coordinació amb PT.
L'app ha de ser ella mateixa un exemple d'accessibilitat: alt contrast, text gran, claredat.`,

  // Alumnat
  'Practicar un contingut': `L'alumne necessita practicar i consolidar un contingut curricular concret.
Contextos habituals: exercicis de matemàtiques, vocabulari d'idiomes, repàs d'història, comprensió lectora, problemes de ciències.
Ha d'incloure retroalimentació immediata i la possibilitat de repetir fins a dominar el contingut.`,

  'Visualitzar un fenomen': `L'alumne necessita comprendre un concepte abstracte a través de la visualització.
Contextos habituals: cicles naturals, processos científics, fenòmens físics, fets històrics, conceptes matemàtics (fraccions, geometria), mapes conceptuals.
Ha d'incloure elements visuals interactius: animacions, diagrames, simulacions simples.`,

  'Autoavaluar-se': `L'alumne necessita reflexionar sobre el seu propi aprenentatge i progrés.
Contextos habituals: autoavaluació d'una activitat, reflexió final d'unitat, establiment d'objectius personals, identificació de punts forts i millores.
Ha de ser un espai de reflexió honesta, sense pressió. El to ha de ser positiu i encoratjador.`,

  'Regular emocions': `L'alumne necessita eines per identificar, expressar i gestionar les seves emocions.
Contextos habituals: activitats de respiració, identificació d'emocions, estratègies de calma, diari emocional, resolució de conflictes.
Ha de ser accessible en moments de tensió: simple, visual i tranquil·litzador.`,

  'Col·laborar en grup': `L'alumne necessita eines per treballar de forma col·laborativa amb companys.
Contextos habituals: repartiment de rols, seguiment de tasques, espai de decisions compartides, presentació de resultats grupals, avaluació entre iguals.
Ha de facilitar la coordinació sense requerir que tots estiguin a la mateixa pantalla.`,

  'Explorar un concepte': `L'alumne necessita explorar un tema de forma autònoma i curiosa.
Contextos habituals: mapes conceptuals interactius, línies del temps, galeries temàtiques, preguntes guiades d'investigació, connexions entre idees.
Ha de fomentar la curiositat i l'exploració lliure dins d'un marc estructurat.`,

  'Jugar per aprendre': `L'alumne necessita aprendre a través d'una experiència lúdica i motivadora.
Contextos habituals: trivials, jocs de rol educatiu, reptes per temps, escape rooms temàtics, jocs de memòria, simulacions.
Ha d'incloure elements de joc reals: punts, nivells, reptes, retroalimentació positiva.
L'objectiu educatiu ha d'estar integrat en la mecànica del joc, no com a afegit.`,

  'Jugar per a aprendre': `L'alumne necessita aprendre a través d'una experiència lúdica i motivadora.
Contextos habituals: trivials, jocs de rol educatiu, reptes per temps, escape rooms temàtics, jocs de memòria, simulacions.
Ha d'incloure elements de joc reals: punts, nivells, reptes, retroalimentació positiva.
L'objectiu educatiu ha d'estar integrat en la mecànica del joc, no com a afegit.`,

  // Reptes Docents — key variants
  'Planificació de situacions d\'aprenentatge': `El docent necessita preparar materials, activitats o recursos per a una sessió concreta.
Contextos habituals: generar exercicis, crear fitxes, dissenyar activitats interactives, preparar preguntes de debat, adaptar contingut per a nivells diferents.
El resultat ha de ser directament usable a l'aula, sense edició addicional.`,

  // Famílies
  'Rebre informació': `La família necessita rebre informació clara sobre el que passa al centre.
Ha de ser concisa, visual i fàcil de llegir en menys de 2 minuts.
Evitar jergues educatives. Usar llenguatge directe i accionable.`,

  'Emplenar formularis': `La família necessita completar formularis de forma ràpida i sense errors.
Ha de guiar pas a pas, validar camps en temps real i confirmar l'enviament.
Ha de funcionar perfectament en mòbil.`,

  'Omplir formularis': `La família necessita completar formularis de forma ràpida i sense errors.
Ha de guiar pas a pas, validar camps en temps real i confirmar l'enviament.
Ha de funcionar perfectament en mòbil.`,

  'Preparar entrevistes': `La família necessita preparar-se per a una entrevista amb el docent o tutor/a.
Pot incloure preguntes freqüents, espai per anotar temes a tractar, recordatoris.`,

  'Comprendre rutines': `La família necessita entendre els horaris, protocols i rutines del centre.
Ha de ser molt visual: calendaris, icones, codis de color. Evitar text llarg.`,

  'Acompanyar benestar': `La família necessita eines per acompanyar el benestar emocional del seu fill/a des de casa.
Ha de ser càlida, senzilla i pràctica. Pot incloure activitats per fer junts.`,

  'Acompanyar el benestar': `La família necessita eines per acompanyar el benestar emocional del seu fill/a des de casa.
Ha de ser càlida, senzilla i pràctica. Pot incloure activitats per fer junts.`,

  'Seguiment del procés d\'aprenentatge': `La família necessita fer seguiment del progrés del seu fill/a de forma visual i comprensible.
Ha de mostrar avenços, assoliments i àrees de millora sense tecnicismes.
Ha de ser motivadora i orientada a l'acció: "Com puc ajudar des de casa?"`,

  'Complementar l\'aprenentatge des de casa': `La família necessita recursos pràctics per reforçar l'aprenentatge escolar a casa.
Ha d'incloure activitats breus, clares i fàcils de fer sense preparació prèvia.
Ha de ser accessible per a qualsevol nivell de competència digital.`,

  // Equip del centre
  'Recollir dades': `L'equip necessita recollir i visualitzar dades del centre de forma estructurada.
Ha de permetre entrada de dades múltiple i presentar resultats visuals clars.`,

  'Organitzar torns': `L'equip necessita gestionar torns de participació o presència de forma equitativa.
Ha de ser visual i permetre detectar desequilibris ràpidament.`,

  'Visualitzar informació': `L'equip necessita presentar dades o indicadors del centre de forma clara i llegible.
Ha de prioritzar la comprensió ràpida: gràfics simples, codis de color, resum executiu.`,

  'Coordinar equips': `L'equip necessita coordinar reunions, decisions i comunicació interna.
Ha de facilitar la presa de decisions col·lectives i el registre d'acords.`,

  'Planificar activitats': `L'equip necessita organitzar la logística d'activitats, sortides o esdeveniments del centre.
Ha d'incloure llistes de verificació, distribució de responsabilitats i seguiment de tasques.`,
};

export const ACCIO_CONTEXT: Record<string, string> = {
  'Generar grups': `L'app distribueix un llistat d'alumnes en grups de forma aleatòria.
Ha de permetre introduir els noms, triar la mida del grup i visualitzar el resultat.
Ha de permetre regenerar els grups si el resultat no convenç.`,

  'Crear horaris': `L'app genera una graella d'horari visual.
Ha de permetre definir dies, franges horàries i assignar contingut a cada cel·la.
Ha de ser llegible d'un cop d'ull i exportable (o imprimible).`,

  'Classificar informació': `L'app permet organitzar i categoritzar informació de forma interactiva.
L'usuari arrossega, ordena o etiqueta elements en categories.
Ha d'incloure retroalimentació visual i un resum de la classificació al final.
Pot incloure mecàniques d'arrossegar i deixar anar (drag & drop).`,

  'Recol·lectar dades i mostrar-los a l\'instant': `L'app recull informació a través d'un formulari i la mostra visualment en temps real.
Ha de permetre entrada múltiple i actualitzar els gràfics o resum automàticament.
Presentar els resultats amb visualitzacions clares: barres, pastís, xifres destacades.
En mode demo (sense backend): guardar les dades en memòria del navegador.`,

  'Suggerències automàtiques': `L'app genera suggerències personalitzades basant-se en les opcions triades per l'usuari.
L'usuari introdueix el seu context o preferències i l'app proposa recursos, activitats o estratègies.
Les suggerències han de ser concretes, accionables i rellevants per al context educatiu.`,

  'Comparar escenaris (abans/després, opció A/B)': `L'app presenta una comparació visual entre dos estats, opcions o moments.
Ha de mostrar les diferències de forma clara: columnes, slider abans/després, o pestanyes A/B.
L'usuari ha de poder explorar les diferències de forma interactiva.
Útil per a anàlisi crítica, presa de decisions o comprensió de canvis.`,

  'Simular situacions (emocionals, socials, científiques...)': `L'app simula una situació real o hipotètica en la qual l'usuari pren decisions.
Cada decisió porta a una conseqüència diferent (arbre de decisions o escenaris ramificats).
Ha d'incloure feedback per cada elecció i un resum final de l'aprenentatge.
Adequat per a educació emocional, dilemes ètics, experiments científics o situacions socials.`,

  'Acompanyar una reflexió emocional': `L'app guia l'usuari en un procés de reflexió sobre les seves emocions o experiències.
Ha d'incloure preguntes obertes o guiades, espai per escriure o triar, i un tancament positiu.
El to ha de ser càlid, no invasiu i respectuós. Evitar jutjar o prescriure respostes.
Pot incloure tècniques de mindfulness, escala d'emocions o diari emocional interactiu.`,

  'Generar retroalimentació': `L'app genera feedback personalitzat basant-se en la informació introduïda.
Pot ser sobre el treball d'un alumne, el comportament del grup o una situació concreta.
El feedback ha de ser constructiu, específic i orientat a la millora.`,

  'Facilitar una activitat creativa': `L'app proporciona un espai o estructura per a l'expressió creativa de l'usuari.
Pot incloure reptes creatius, plantilles obertes, generació de idees o producció lliure.
Ha de fomentar l'autonomia i la creativitat, sense limitar les respostes possibles.
El disseny ha de ser visualment inspirador i estimulant.`,

  'Crear un mini-joc': `L'app és un joc educatiu senzill amb mecàniques de gamificació.
Ha d'incloure puntuació, retroalimentació immediata i un objectiu clar.
El contingut educatiu ha d'estar integrat en la mecànica del joc.
Exemples: trivial, joc de memòria, ordenar seqüències, associar conceptes.`,

  'Ruletes, sortejos, targetes aleatòries': `L'app genera elements aleatoris de forma visual i atractiva.
Pot ser una ruleta giratòria, un sorteig de noms, targetes aleatòries o daus temàtics.
Ha de tenir una animació clara del procés i mostrar el resultat de forma destacada.
Útil per a dinàmiques d'aula, assignació de rols o activitats d'atzar educatiu.`,

  // Legacy keys
  'Recollir dades': `L'app recull informació estructurada a través d'un formulari o registre.
Ha de permetre entrada múltiple i mostrar un resum o visualització dels resultats.`,
  'Simular un fenomen': `L'app visualitza un procés o fenomen de forma interactiva.
Ha d'incloure elements animats o dinàmics que l'usuari pugui controlar.`,
  'Comparar opcions': `L'app presenta una comparació estructurada entre dues o més opcions.
Ha de mostrar criteris i diferències de forma visual.`,
};

export const ESTIL_CONTEXT: Record<string, string> = {
  'Minimalista': `Disseny net i sobri. Fons blanc o gris clar. Tipografia sans-serif llegible.
Pocs elements a la pantalla. Molt espai en blanc. Sense decoració innecessària.
Colors: blanc (#FFFFFF), gris clar (#F9FAFB), un sol color d'acció (blau o verd fosc).
Estil professional. Adequat per a docents i equip del centre.`,

  'Alt contrast': `Disseny accessible per a persones amb dificultats visuals.
Fons negre o molt fosc. Text blanc o groc. Botons grans amb text gran.
Sense imatges decoratives. Tota la informació en text llegible.
Colors: #000000 fons, #FFFFFF o #FFFF00 text, #0066CC per a botons.
Mida de lletra mínima 18px. Interlineatge generós.`,

  'Infantil': `Disseny colorit, rodó i amigable per a nens i nenes.
Colors vius i alegres (vermell, groc, verd, blau). Formes arrodonides.
Tipografia gran i llegible. Moltes icones i il·lustracions.
Animacions suaus en les interaccions. To playful i positiu.
Adequat per a primària (6-12 anys).`,

  'Científic': `Disseny rigorós i estructurat. Colors neutres amb accents de colors tècnics (blau, verd, taronja).
Taules, gràfics i visualitzacions de dades. Tipografia mono per a valors i dades.
Estil semblant a un dashboard científic o taulell de laboratori.
Adequat per a secundària i batxillerat en matèries STEM.`,

  'Mode pissarra': `Disseny que evoca una pissarra de classe. Fons fosc (verd pissarra o negre).
Text blanc o de colors com si fos guix. Tipografia que sembla escrita a mà.
Elements visuals senzills, com diagrames dibuixats.
Crea ambient de classe. Adequat per a activitats de grup projectades.`,

  'Colors suaus': `Disseny amb paleta pastel: roses, liles, blaus clars, verds suaus.
Estètica càlida i acollidora. Tipografia arrodonida i amigable.
Animacions suaus i transicions fluides. Molt espai blanc.
Adequat per a activitats de benestar emocional o famílies.`,

  'Tipografia gran': `Disseny centrat en la llegibilitat màxima. Mida de lletra mínima 20px, titulars molt grans.
Molt contrast entre text i fons. Interlineatge ampli. Sense elements decoratius que distreguin.
Adequat per a pantalla gran projectada, alumnat amb dificultats de visió o activitats col·lectives.
Pot combinar-se amb qualsevol paleta de colors, però prioritzant sempre la lectura fàcil.`,

  'Amb animacions': `Disseny que usa animacions CSS per fer les interaccions més atractives.
Transicions suaves entre estats. Elements que apareixen amb fade o slide.
Feedback visual animat quan l'usuari fa una acció correcta o completa una tasca.
No abusar: les animacions han de tenir propòsit, no ser decoratives.`,

  'Creatiu / artístic': `Disseny expressiu, visual i estèticament atrevit. Colors vius o paletes inusuals.
Tipografies expressives. Espai per a la creació, la producció i l'expressió personal.
Elements visuals inspiradors: formes orgàniques, textures, il·lustracions.
El disseny ha de transmetre llibertat creativa i convidar a l'expressió.`,

  'Ludificat': `Disseny que incorpora mecàniques de joc visuals: barres de progrés, estrelles, nivells, medalles.
Colors vius i contrastats. Tipografia bold i enèrgica.
Animacions de recompensa en cada acció correcta (simulats amb CSS/JS).
El disseny ha de transmetre emoció i motivació des del primer moment.`,

  'Interactiu (botons, sliders, arrossegar)': `Disseny centrat en la interacció física directa: botons grans, sliders, elements arrossegables.
Cada acció ha de tenir resposta visual immediata (canvi de color, animació, so).
La interfície ha de ser intuïtiva: l'usuari sap què fer sense llegir instruccions.
Prioritzar elements tàctils pensats per a pantalla tàctil (mòbil i tauleta).`,

  'Narratiu (per passos)': `Disseny estructurat com una història o procés seqüencial. Un pas visible a la vegada.
Navegació lineal clara: anterior / següent. Indicador de progrés visible.
El to i el disseny han d'acompanyar la narrativa: càlid, seqüencial, sense salts.
Cada pas ha d'incloure context suficient per seguir sense perdre el fil.`,

  // Legacy keys
  'Amb dibuixos': `Disseny que usa il·lustracions simples o icones estil sketch/doodle.
Estètica handmade o artesanal. Línies irregulars, colors plans.
Adequat per a activitats creatives o de primària.`,
  'Interactiva / gamificada': `Disseny que incorpora mecàniques de joc visuals: barres de progrés, estrelles, nivells, medalles.
Colors vius i contrastats. Tipografia bold i enèrgica.`,
  'Estil fitxa / sobri': `Disseny estructurat com una fitxa o document formal.
Camps clarament delimitats, etiquetes, seccions amb capçaleres.
Colors neutres. Adequat per a formularis, registres i informes.`,
};

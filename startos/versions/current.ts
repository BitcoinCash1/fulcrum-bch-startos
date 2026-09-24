import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

/**
 * Whether users may downgrade from this release to an earlier one. Set it per
 * release: `true` only when earlier versions can still read the data this one
 * leaves behind, `false` when this release is one-way.
 */
const ALLOW_DOWNGRADE = false

export const current = VersionInfo.of({
  version: '2.1.2:0',
  releaseNotes: {
    en_US: `Fulcrum 2.1.2, and Knuth as a node backend.

Updates Fulcrum to upstream 2.1.2. Knuth can now be chosen in Select Node Backend alongside Bitcoin Cash Node, Bitcoin Cash Daemon and Flowee the Hub; choosing it asks Knuth to enable JSON-RPC and the full database mode, which Fulcrum needs to index it.`,
    es_ES: `Fulcrum 2.1.2 y Knuth como nodo de origen.

Actualiza Fulcrum a la versión 2.1.2. Ahora se puede elegir Knuth en Seleccionar nodo de origen junto a Bitcoin Cash Node, Bitcoin Cash Daemon y Flowee the Hub; al elegirlo se pide a Knuth que active JSON-RPC y el modo de base de datos completo, que Fulcrum necesita para indexarlo.`,
    de_DE: `Fulcrum 2.1.2 und Knuth als Knoten-Backend.

Aktualisiert Fulcrum auf Version 2.1.2. Knuth kann jetzt unter „Knoten-Backend wählen“ neben Bitcoin Cash Node, Bitcoin Cash Daemon und Flowee the Hub gewählt werden; dabei wird Knuth gebeten, JSON-RPC und den vollständigen Datenbankmodus zu aktivieren, die Fulcrum zum Indizieren braucht.`,
    pl_PL: `Fulcrum 2.1.2 oraz Knuth jako węzeł źródłowy.

Aktualizuje Fulcrum do wersji 2.1.2. Knuth można teraz wybrać w opcji wyboru węzła obok Bitcoin Cash Node, Bitcoin Cash Daemon i Flowee the Hub; wybranie go prosi Knuth o włączenie JSON-RPC i pełnego trybu bazy danych, których Fulcrum potrzebuje do indeksowania.`,
    fr_FR: `Fulcrum 2.1.2, et Knuth comme nœud source.

Met à jour Fulcrum vers la version 2.1.2. Knuth peut désormais être choisi dans la sélection du nœud, aux côtés de Bitcoin Cash Node, Bitcoin Cash Daemon et Flowee the Hub ; le choisir demande à Knuth d'activer JSON-RPC et le mode de base de données complet, dont Fulcrum a besoin pour l'indexer.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: ALLOW_DOWNGRADE ? async () => {} : IMPOSSIBLE,
  },
})

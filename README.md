# Étude de cas TMA - Prise de rendez-vous au guichet

Ce projet contient l'analyse et la correction des règles de gestion de
l'application de prise de rendez-vous au guichet.

## 1. Qualification des tickets

### Synthèse

| Ticket | Qualification |
| --- | --- |
| TMA-101 | Anomalie |
| TMA-102 | Anomalie |
| TMA-103 | Anomalie |
| TMA-104 | Anomalie |
| TMA-105 | Anomalie |
| TMA-106 | Anomalie |
| TMA-107 | Comportement conforme |

### TMA-101 - Rendez-vous accepté un samedi

**Qualification :** anomalie.

Le rendez-vous a été accepté pour le samedi 14 novembre 2026.

La règle précise que le centre reçoit uniquement du lundi au vendredi. Une
demande pour un samedi ou un dimanche doit être refusée avec le code HTTP 409
et le message `Le centre est fermé le week-end.`

Le comportement observé n'est donc pas conforme.

### TMA-102 - Quatrième rendez-vous accepté sur un créneau

**Qualification :** anomalie.

Quatre rendez-vous non annulés ont été acceptés pour le même créneau du
10 novembre 2026 à 9 h.

La règle limite un créneau à trois usagers. Seuls les rendez-vous annulés
libèrent une place. Puisque les trois rendez-vous précédents existaient encore
lorsque le quatrième a été créé, le créneau était complet.

La quatrième demande devait être refusée avec le code HTTP 409 et le message
`Ce créneau est complet.`

### TMA-103 - NPI invalide transformé en erreur interne

**Qualification :** anomalie.

Le NPI `06142A3647` contient une lettre et n'est donc pas composé de dix
chiffres.

La règle prévoit qu'un NPI invalide doit produire une réponse HTTP 400 avec le
message `Le NPI doit comporter exactement 10 chiffres.`

L'application a renvoyé une erreur HTTP 500. Or l'énoncé précise qu'une saisie
invalide doit être refusée avec le message fonctionnel prévu, jamais avec une
erreur interne.

### TMA-104 - Annulation refusée 40 heures avant le rendez-vous

**Qualification :** anomalie.

L'annulation a été demandée le 17 novembre 2026 à 18 h pour un rendez-vous
prévu le 19 novembre 2026 à 10 h.

Il restait exactement 40 heures avant le rendez-vous. La règle autorise
l'annulation jusqu'à 24 heures avant l'heure prévue. Le délai était donc
suffisant et l'annulation devait être acceptée.

Le refus pour annulation tardive n'est pas conforme.

### TMA-105 - Modification d'un statut définitif

**Qualification :** anomalie.

Le rendez-vous no 292 était déjà au statut `annule`, mais l'application a
accepté son passage au statut `honore`.

La règle indique qu'un rendez-vous confirmé peut devenir `honore`, `absent` ou
`annule`, puis que ces trois statuts sont définitifs. Un rendez-vous annulé ne
peut donc plus changer de statut.

La demande devait être refusée avec le code HTTP 409 et le message
`Ce rendez-vous est déjà clôturé.`

### TMA-106 - Prochain rendez-vous absent de la première page

**Qualification :** anomalie.

Le prochain rendez-vous de l'usager, prévu le 2 décembre 2026, n'apparaît pas
sur la première page.

La règle demande que le prochain rendez-vous soit placé en tête de la liste et
que les rendez-vous soient présentés par pages de dix. Le comportement observé
n'est donc pas conforme.

### TMA-107 - Second rendez-vous refusé pour un autre service

**Qualification :** comportement conforme.

L'usager possède déjà un rendez-vous à venir pour un passeport. Le fait que la
nouvelle demande concerne un permis ne change pas la règle : la limite porte
sur tous les services confondus.

Le refus avec le code HTTP 409 et le message
`Vous avez déjà un rendez-vous à venir.` est donc conforme.

## 2. Diagnostic des anomalies

Les diagnostics ci-dessous sont déduits des traces et de l'export de la base de données.

### TMA-101 - Contrôle du jour de la semaine absent

L'application accepte une date future sans vérifier qu'elle correspond à un
jour d'ouverture. Le samedi 14 novembre 2026 passe probablement les contrôles
de format, de date future et d'heure d'ouverture, mais aucun contrôle ne semble
être effectué sur le jour de la semaine.

**Erreur probable :** contrôle métier absent.

**Correction :** après avoir interprété la date dans le fuseau du Bénin,
vérifier son jour de la semaine. Un samedi ou un dimanche doit être refusé avec
le code HTTP 409 et le message `Le centre est fermé le week-end.`

### TMA-102 - Mauvaise borne dans le contrôle de capacité

Le rendez-vous no 697 a été accepté alors que trois rendez-vous non annulés
occupaient déjà le créneau. La trace précise que ces trois rendez-vous
existaient avant la quatrième réservation ; le problème ne semble donc pas
provenir de créations concurrentes.

La cause la plus probable est un contrôle utilisant `nombre > 3` avant
l'insertion. Lorsque trois rendez-vous existent, la condition `3 > 3` est
fausse et le quatrième est accepté.

**Erreur probable :** erreur de borne.

**Correction :** compter tous les rendez-vous non annulés du créneau et
refuser la demande dès que ce nombre est supérieur ou égal à trois. Le refus
doit utiliser le code HTTP 409 et le message `Ce créneau est complet.`

### TMA-103 - Validation du NPI trop tardive

Le NPI `06142A3647` contient une lettre, mais l'application retourne une
erreur HTTP 500.

L'application utilise ou convertit probablement le NPI avant d'avoir validé
son format. Par exemple, en JavaScript ou TypeScript, une conversion stricte
comme `BigInt("06142A3647")` lève une `SyntaxError`. Si cette erreur arrive
jusqu'au gestionnaire générique de l'API, elle est transformée en erreur HTTP
500 au lieu de produire l'erreur fonctionnelle attendue.

Le comportement exact dépend du langage utilisé par l'application d'origine.
Il pourrait également s'agir d'une conversion stricte effectuée par une
bibliothèque ou par la base de données. Sans le code source, l'origine exacte
de l'exception ne peut pas être confirmée.

**Erreur probable :** le NPI est validé trop tard et l'exception technique
n'est pas convertie en erreur fonctionnelle.

**Correction :** conserver le NPI sous forme de chaîne afin de préserver les
zéros initiaux, puis vérifier avant tout autre traitement qu'il contient
exactement dix chiffres. En cas d'échec, retourner le code HTTP 400 et le
message `Le NPI doit comporter exactement 10 chiffres.`

### TMA-104 - Perte de précision dans le calcul du délai

La demande d'annulation est effectuée le 17 novembre 2026 à 18 h pour un
rendez-vous prévu le 19 novembre 2026 à 10 h. La durée restante est donc de
40 heures.

La cause la plus probable est une conversion de cette durée en nombre entier
de jours avant la comparaison. Quarante heures deviennent alors un jour
entier, les seize heures restantes étant perdues. L'application peut ainsi
considérer à tort que le rendez-vous se trouve à un jour ou moins.

Une autre possibilité serait une soustraction effectuée dans le mauvais sens.
Elle risquerait cependant de refuser beaucoup plus largement les annulations
futures. La perte de précision lors d'une conversion en jours correspond mieux
au cas observé.

**Erreur probable :** calcul dans une unité trop imprécise ou durée tronquée.

**Correction :** calculer la durée exacte entre la date et l'heure de la
demande d'annulation, reçues par le module dans le paramètre `maintenant`, et
la date et l'heure du rendez-vous :

```text
délai restant = date du rendez-vous - maintenant
```

L'annulation doit être refusée uniquement si cette durée est strictement
inférieure à 24 heures. À exactement 24 heures, elle reste autorisée. Les deux
instants doivent être interprétés dans le fuseau du Bénin.

### TMA-105 - Statut actuel non contrôlé

L'application vérifie probablement que le statut demandé appartient aux
valeurs autorisées `honore` et `absent`, mais ne vérifie pas que le statut
actuel est `confirme`. Une valeur cible valide est alors acceptée même si le
rendez-vous est déjà `annule`.

L'historique de la base confirme la transition incorrecte :

```text
confirme -> annule -> honore
```

**Erreur probable :** validation de la valeur cible sans validation de la
transition complète.

**Correction :** autoriser uniquement les transitions `confirme -> honore` et
`confirme -> absent` dans l'opération de changement de statut. Toute demande
effectuée depuis `honore`, `absent` ou `annule` doit être refusée avec le code
HTTP 409 et le message `Ce rendez-vous est déjà clôturé.`

### TMA-106 - Tri effectué sur les dates formatées

L'ordre renvoyé fournit un indice précis :

```text
28/07/2026, 25/09/2026, 21/04/2026, 19/05/2026, 16/06/2026,
12/02/2026, 11/08/2026, 08/05/2026, 07/07/2026
```

Les jours du mois sont classés presque parfaitement par ordre décroissant :
`28`, `25`, `21`, `19`, `16`, `12`, `11`, `08`, `07`. L'application trie donc
probablement les dates après les avoir formatées en chaînes `JJ/MM/AAAA`. Un
tri alphabétique compare d'abord le jour, puis le mois et enfin l'année ; il ne
respecte pas l'ordre chronologique.

Le rendez-vous du 2 décembre commence par `02`. Il est alors placé après les
dates commençant par des jours plus élevés et se retrouve hors de la première
page.

**Erreur probable :** tri lexicographique des dates déjà formatées.

**Correction :** trier les rendez-vous à partir de leur date complète avant de
les formater pour l'affichage. Les rendez-vous à venir sont classés par date
croissante afin de placer le prochain en tête, puis les rendez-vous passés par
date décroissante. La pagination par groupes de dix est appliquée après ce tri
global.

### TMA-107 - Aucun diagnostic d'anomalie

Le comportement de TMA-107 est conforme à la règle. Il ne nécessite donc
aucune correction. Un test de non-régression devra néanmoins vérifier qu'un
usager possédant déjà un rendez-vous à venir ne peut pas en prendre un autre,
même pour un service différent.

## 3. Module de règles de gestion

Le module est indépendant de toute base de données et de tout framework. Il
reçoit les données nécessaires en paramètres et ne lit jamais directement
l'horloge de la machine.

Ses quatre opérations principales sont :

| Fonction | Responsabilité |
| --- | --- |
| `validateBooking` | Contrôler une demande de rendez-vous complète. |
| `validateCancellation` | Contrôler le statut et le délai d'annulation. |
| `validateStatusChange` | Contrôler une transition vers `honore` ou `absent`. |
| `sortAndPaginateAppointments` | Trier la liste complète puis retourner une page de dix éléments. |

`validateBooking` applique les contrôles dans l'ordre suivant : NPI, service,
date lisible, date future, jour d'ouverture, grille horaire, rendez-vous à
venir de l'usager, puis capacité du créneau. La première erreur rencontrée est
retournée avec le code HTTP et le message prévus.

Le contrôle de capacité est une règle pure fondée sur l'état reçu. Dans une
application en production, la lecture du nombre de places et l'insertion du
rendez-vous doivent également être protégées par une transaction ou un
verrouillage adapté afin d'empêcher deux réservations concurrentes de dépasser
la capacité.

## 4. Tests automatisés

### Installation et exécution

```bash
npm ci
npm test
```

La vérification statique TypeScript s'exécute séparément :

```bash
npm run build
```

### Correspondance entre les tickets et les tests

| Ticket | Correction ou comportement préservé | Test |
| --- | --- | --- |
| TMA-101 | Refus des samedis et dimanches en heure du Bénin. | `tests/tickets/tma-101.test.ts` |
| TMA-102 | Refus dès que trois rendez-vous non annulés occupent le créneau. | `tests/tickets/tma-102.test.ts` |
| TMA-103 | Validation du NPI comme chaîne de dix chiffres. | `tests/tickets/tma-103.test.ts` |
| TMA-104 | Comparaison exacte du délai restant avec 24 heures. | `tests/tickets/tma-104.test.ts` |
| TMA-105 | Refus de toute transition depuis un statut définitif. | `tests/tickets/tma-105.test.ts` |
| TMA-106 | Tri chronologique global avant la pagination. | `tests/tickets/tma-106.test.ts` |
| TMA-107 | Refus d'un second rendez-vous futur, tous services confondus. | `tests/tickets/tma-107.test.ts` |

Le fichier `tests/boundaries.test.ts` couvre également les bornes importantes :
NPI avec zéro initial, créneaux de `08:00` et `15:30`, annulation à exactement
24 heures, rendez-vous annulé libérant une place, statuts demandés et deuxième
page de résultats.

## 5. Requêtes d'impact

Les requêtes du fichier `requetes.sql` sont écrites pour SQLite. Elles peuvent
être exécutées sur l'export sans créer de fichier intermédiaire :

```bash
sqlite3 :memory: <<'SQL'
.read data/base_rendez_vous.sql
.read requetes.sql
SQL
```

L'instant de référence est celui de l'export : le 20 novembre 2026 à 18 h,
heure du Bénin.

### Rendez-vous confirmés à venir programmés le week-end

Cinq rendez-vous doivent faire l'objet d'une prise de contact :

| Identifiant | NPI | Service | Date et heure |
| ---: | --- | --- | --- |
| 680 | 0669147625 | PASSEPORT | 21/11/2026 à 08:30 |
| 730 | 0679617916 | CNI | 28/11/2026 à 09:00 |
| 834 | 0610588823 | CNI | 05/12/2026 à 10:00 |
| 857 | 0671987446 | PERMIS | 05/12/2026 à 10:00 |
| 874 | 0648953073 | PASSEPORT | 12/12/2026 à 11:00 |

### Créneaux comptant plus de trois rendez-vous non annulés

Trois créneaux contiennent chacun quatre rendez-vous non annulés :

| Créneau | Nombre |
| --- | ---: |
| 22/10/2026 à 10:30 | 4 |
| 10/11/2026 à 09:00 | 4 |
| 24/11/2026 à 14:00 | 4 |

### Transitions depuis le statut annulé

Quatre rendez-vous ont été modifiés après leur annulation :

| Rendez-vous | Transition | Modification | Agent |
| ---: | --- | --- | --- |
| 208 | `annule -> honore` | 07/10/2026 à 10:20 | AG-01 |
| 231 | `annule -> honore` | 15/10/2026 à 10:26 | AG-02 |
| 262 | `annule -> absent` | 29/10/2026 à 10:21 | AG-03 |
| 292 | `annule -> honore` | 12/11/2026 à 10:13 | AG-04 |

## 6. Bonus - anomalies supplémentaires dans l'export

### NPI de longueur incorrecte

Deux rendez-vous possèdent un NPI de onze ou douze chiffres :

| Identifiant | NPI | Date et heure | Statut |
| ---: | --- | --- | --- |
| 459 | 01234567890 | 20/10/2026 à 09:30 | absent |
| 642 | 061425364711 | 03/11/2026 à 14:00 | honore |

La règle `validateNpi` corrige ce défaut en exigeant exactement dix chiffres
avant tout autre traitement.

### Rendez-vous hors de la grille horaire

Trois rendez-vous ont été enregistrés après le dernier créneau de 15 h 30 :

| Identifiant | Date et heure | Statut |
| ---: | --- | --- |
| 490 | 27/10/2026 à 16:00 | honore |
| 698 | 13/11/2026 à 16:30 | absent |
| 842 | 08/12/2026 à 16:00 | confirme |

Le rendez-vous no 842 est encore à venir à la date de l'export et doit faire
l'objet d'une prise de contact. La règle `validateTimeSlot` impose désormais
une heure comprise entre `08:00` et `15:30`, sur la grille de 30 minutes.

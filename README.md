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

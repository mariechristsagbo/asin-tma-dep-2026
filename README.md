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

-- Requêtes d'impact exécutées avec SQLite.
-- L'export a été réalisé le 20 novembre 2026 à 18:00, heure du Bénin.

-- 1. Rendez-vous confirmés à venir programmés un samedi ou un dimanche.
SELECT id, npi, service, date_heure
FROM rendez_vous
WHERE statut = 'confirme'
  AND date_heure > '2026-11-20 18:00:00'
  AND strftime('%w', date_heure) IN ('0', '6')
ORDER BY date_heure, id;

-- 2. Créneaux comptant plus de trois rendez-vous non annulés.
SELECT date_heure, COUNT(*) AS nombre_rendez_vous
FROM rendez_vous
WHERE statut <> 'annule'
GROUP BY date_heure
HAVING COUNT(*) > 3
ORDER BY date_heure;

-- 3. Rendez-vous passés du statut annule à un autre statut.
SELECT
  h.rendez_vous_id,
  h.ancien_statut,
  h.nouveau_statut,
  h.modifie_le,
  h.modifie_par
FROM historique_statuts AS h
WHERE h.ancien_statut = 'annule'
  AND h.nouveau_statut <> 'annule'
ORDER BY h.modifie_le, h.rendez_vous_id;

-- Bonus 1. Rendez-vous enregistrés avec un NPI qui n'a pas dix chiffres.
SELECT id, npi, service, date_heure, statut
FROM rendez_vous
WHERE length(npi) <> 10
   OR npi NOT GLOB '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
ORDER BY id;

-- Bonus 2. Rendez-vous enregistrés en dehors de la grille horaire.
SELECT id, npi, service, date_heure, statut
FROM rendez_vous
WHERE CAST(strftime('%H', date_heure) AS INTEGER) < 8
   OR CAST(strftime('%H', date_heure) AS INTEGER) > 15
   OR CAST(strftime('%M', date_heure) AS INTEGER) NOT IN (0, 30)
ORDER BY date_heure, id;

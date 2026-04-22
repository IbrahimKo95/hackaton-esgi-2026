CREATE TYPE "UserRank" AS ENUM ('BASIC', 'BRONZE', 'SILVER', 'GOLD', 'PREMIUM');

ALTER TABLE "User"
ADD COLUMN "reservationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "rank" "UserRank" NOT NULL DEFAULT 'BASIC';

WITH counts AS (
  SELECT
    u.id,
    COALESCE(r.res_count, 0) + COALESCE(hr.hotel_res_count, 0) AS total_count
  FROM "User" u
  LEFT JOIN (
    SELECT "userId", COUNT(*)::INTEGER AS res_count
    FROM "Reservation"
    GROUP BY "userId"
  ) r ON r."userId" = u.id
  LEFT JOIN (
    SELECT "userId", COUNT(*)::INTEGER AS hotel_res_count
    FROM "HotelReservation"
    GROUP BY "userId"
  ) hr ON hr."userId" = u.id
)
UPDATE "User" u
SET "reservationCount" = counts.total_count,
    "rank" = CASE
      WHEN counts.total_count >= 100 THEN 'PREMIUM'::"UserRank"
      WHEN counts.total_count >= 50 THEN 'GOLD'::"UserRank"
      WHEN counts.total_count >= 25 THEN 'SILVER'::"UserRank"
      WHEN counts.total_count >= 10 THEN 'BRONZE'::"UserRank"
      ELSE 'BASIC'::"UserRank"
    END
FROM counts
WHERE counts.id = u.id;

DROP TABLE "UserBadge";
DROP TABLE "Badge";
DROP TYPE "BadgeCategory";

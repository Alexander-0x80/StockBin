CREATE TABLE IF NOT EXISTS `portfolios` (
    `id`        INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `url`       CHAR(12)        NOT NULL,
    `members`   JSON            NOT NULL,
    `name`      VARCHAR(64)        DEFAULT NULL,
    `lock`      VARCHAR(32)        DEFAULT NULL,

                PRIMARY KEY (`id`),
                KEY (`url`)

) CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `symbols` (
    `symbol`    CHAR(5)         NOT NULL,
    `desc`      VARCHAR(48)     DEFAULT NULL
);

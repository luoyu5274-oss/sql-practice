-- ============================================================
-- SQL 练习平台 - 数据库初始化脚本（SQLite 版本）
-- 数据来源于 SQLBolt.com 教程
-- ============================================================

-- 电影表
CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    director TEXT NOT NULL,
    year INTEGER NOT NULL,
    length_minutes INTEGER NOT NULL
);

-- 票房表
CREATE TABLE IF NOT EXISTS boxoffice (
    movie_id INTEGER PRIMARY KEY,
    rating REAL NOT NULL,
    domestic_sales INTEGER NOT NULL,
    international_sales INTEGER NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
);

-- 建筑表
CREATE TABLE IF NOT EXISTS buildings (
    building_name TEXT PRIMARY KEY,
    capacity INTEGER NOT NULL
);

-- 员工表
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    building TEXT,
    years_employed INTEGER NOT NULL,
    FOREIGN KEY (building) REFERENCES buildings(building_name)
);

-- 北美城市表
CREATE TABLE IF NOT EXISTS north_american_cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    population INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
);

-- ============================================================
-- 种子数据
-- ============================================================

-- 电影数据（皮克斯动画）
INSERT OR IGNORE INTO movies (id, title, director, year, length_minutes) VALUES
(1, 'Toy Story', 'John Lasseter', 1995, 81),
(2, 'A Bug''s Life', 'John Lasseter', 1998, 95),
(3, 'Toy Story 2', 'John Lasseter', 1999, 92),
(4, 'Monsters, Inc.', 'Pete Docter', 2001, 92),
(5, 'Finding Nemo', 'Andrew Stanton', 2003, 107),
(6, 'The Incredibles', 'Brad Bird', 2004, 116),
(7, 'Cars', 'John Lasseter', 2006, 117),
(8, 'Ratatouille', 'Brad Bird', 2007, 115),
(9, 'WALL-E', 'Andrew Stanton', 2008, 104),
(10, 'Up', 'Pete Docter', 2009, 101),
(11, 'Toy Story 3', 'Lee Unkrich', 2010, 103),
(12, 'Cars 2', 'John Lasseter', 2011, 120),
(13, 'Brave', 'Brenda Chapman', 2012, 102),
(14, 'Monsters University', 'Dan Scanlon', 2013, 110);

-- 票房数据
INSERT OR IGNORE INTO boxoffice (movie_id, rating, domestic_sales, international_sales) VALUES
(1, 8.3, 191796233, 170162503),
(2, 7.2, 162798565, 200600000),
(3, 7.9, 245852179, 239163000),
(4, 8.1, 289916256, 272900000),
(5, 8.1, 380843261, 555900000),
(6, 8.0, 261441092, 370001000),
(7, 7.1, 244082982, 217900167),
(8, 8.0, 206445654, 417277164),
(9, 8.5, 223808164, 297503696),
(10, 8.3, 293004164, 438338580),
(11, 8.3, 415004880, 648167031),
(12, 6.2, 191452396, 368400000),
(13, 7.1, 237283207, 301700000),
(14, 7.3, 268492764, 475066843);

-- 建筑数据
INSERT OR IGNORE INTO buildings (building_name, capacity) VALUES
('1e', 24),
('1w', 32),
('2e', 16),
('2w', 20);

-- 员工数据
INSERT OR IGNORE INTO employees (name, role, building, years_employed) VALUES
('Becky A.', 'Engineer', '1e', 4),
('Dan B.', 'Engineer', '2e', 2),
('Sharon F.', 'Engineer', '1e', 6),
('Dan M.', 'Engineer', '1e', 4),
('Malcom S.', 'Engineer', '1e', 1),
('Tylar S.', 'Engineer', '2w', 2),
('Rhett B.', 'Artist', '2w', 5),
('Linda J.', 'Artist', '1e', 8),
('Anita K.', 'Artist', '2w', 3),
('Claire D.', 'Artist', '2e', 6),
('Mary J.', 'Artist', '1w', 8),
('Katie L.', 'Artist', '2w', 2),
('Sofia L.', 'Artist', '2w', 4),
('Heidi S.', 'Manager', '1e', 10),
('Megan S.', 'Manager', '1w', 7),
('Sara T.', 'Manager', '2e', 8),
('Carrie P.', 'Manager', '1w', 6),
('Larry W.', 'Manager', '2w', 9),
('John S.', 'Intern', NULL, 0),
('Kim T.', 'Intern', NULL, 0),
('David B.', 'Intern', NULL, 0);

-- 北美城市数据
INSERT OR IGNORE INTO north_american_cities (city, country, population, latitude, longitude) VALUES
('Guadalajara', 'Mexico', 1500800, 20.659699, -103.349609),
('Toronto', 'Canada', 2795060, 43.653226, -79.383184),
('Houston', 'United States', 2195914, 29.760427, -95.369803),
('New York', 'United States', 8405837, 40.712784, -74.005941),
('Philadelphia', 'United States', 1553165, 39.952584, -75.165222),
('Havana', 'Cuba', 2106146, 23.054070, -82.345189),
('Mexico City', 'Mexico', 8555500, 19.432608, -99.133208),
('Phoenix', 'United States', 1513367, 33.448377, -112.074037),
('Los Angeles', 'United States', 3884307, 34.052234, -118.243685),
('Ecatepec de Morelos', 'Mexico', 1742000, 19.600000, -99.050000),
('Montreal', 'Canada', 1717767, 45.501689, -73.567256),
('Chicago', 'United States', 2718782, 41.878114, -87.629798);

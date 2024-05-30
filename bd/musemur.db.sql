drop database if exists musemur;
create database musemur;
use musemur;

drop table if exists usuarios;

create table usuarios (
id_user INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
user_first_name varchar(30)not null,
user_surname varchar(40) not null,
username varchar(255) not null,
user_phone int(9),
user_email varchar(50),
user_dni varchar(9) not null unique,
user_pswrd varchar(20) not null check(length(user_pswrd)>=8 and
										user_pswrd regexp '[0-9]' and
										user_pswrd regexp '[A-Z]' and
										user_pswrd regexp '[a-z]'),
user_rol boolean);

drop table if exists museos;

create table museos (
id_museo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
museum_name varchar(30),
museum_city varchar(30),
museum_loc varchar(100),
museum_desc varchar(200),
museum_hour varchar(10),
museum_img blob
);

drop table if exists reservas;

create table reservas (
id_reserva INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
id_user INT UNSIGNED,
id_museo INT UNSIGNED,
reserva_date date,
reserva_hour time,
reserva_people int(20),
FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE CASCADE,
FOREIGN KEY (id_museo) REFERENCES museos(id_museo) ON DELETE CASCADE);

drop table if exists chatbox;

create table chatbox(
id_que INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
id_museo int unsigned,
cb_que varchar(50),
cb_res varchar(50),
FOREIGN KEY (id_museo) references museos(id_museo));

drop table if exists admin;

create table admin (
id_admin INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
id_museo INT UNSIGNED,
FOREIGN KEY (id_museo) references museos(id_museo) on delete cascade,
FOREIGN KEY (id_admin) references usuarios(id_user)
on delete cascade);

-- Crear un disparador para validar el rol del administrador
DELIMITER $$
CREATE TRIGGER check_admin_role 
BEFORE INSERT ON admin
FOR EACH ROW
BEGIN
    DECLARE userrol boolean;
SELECT 
    rol
INTO userrol FROM
    usuarios
WHERE
    id_user = NEW.id_admin;
    IF userrol != 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El administrador debe tener el rol de admin';
    END IF;
END$$
DELIMITER ;

-- Usuario Demo
commit; 
insert into usuarios values (0,'adrian', 'tudela', 'adriantudelaa', 654879856, 'adri40295@gmail.com', '24419446r', 'Demo2024',1);
SELECT * from museos;


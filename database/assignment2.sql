--Select statements
SELECT * FROM public.inventory 
WHERE inv_id=1;
SELECT inv_make,inv_model,inv_year 
FROM public.inventory 
WHERE inv_id=1;
--Update Statements
UPDATE public.inventory 
SET inv_year ='2025'  
WHERE inv_id=1;
--Delete Statements
DELETE FROM public.inventory  
WHERE inv_id=2;

--QUERIES
--1- Insert Tony Stark
INSERT INTO public.account(
    account_firstname,
    account_lastname,
    account_email,
    account_password
)
VALUES(
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
);

--2-Update Tony Stark to Admin
UPDATE  public.account 
SET account_type = 'Admin' 
WHERE account_id=1;
--3-Delete Tony Stark
DELETE FROM public.account  
WHERE account_id=1;

--4-Update GM Hummer
UPDATE public.inventory 
SET inv_description = REPLACE(inv_description,'small interiors','a huge interior') 
WHERE inv_id = 10;

--5-Select from inventory type sport

SELECT inv_make,inv_model 
FROM public.inventory as i INNER JOIN public.classification as s
ON i.classification_id=s.classification_id
WHERE s.classification_name='Sport';

--6-Update all inventory by adding /vehicles
UPDATE public.inventory 
SET inv_image = REPLACE(inv_image,'/images','/images/vehicles'),inv_thumbnail = REPLACE(inv_thumbnail,'/images','/images/vehicles');

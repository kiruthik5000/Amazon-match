-- Add location columns to products
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS latitude  DOUBLE       NULL,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE       NULL,
    ADD COLUMN IF NOT EXISTS city      VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS state     VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS country   VARCHAR(100) NULL DEFAULT 'IN';

-- Seed realistic Indian city coordinates for existing products
UPDATE products SET latitude=12.9716,longitude=77.5946,city='Bangalore', state='Karnataka',  country='IN' WHERE id=1;
UPDATE products SET latitude=19.0760,longitude=72.8777,city='Mumbai',    state='Maharashtra',country='IN' WHERE id=2;
UPDATE products SET latitude=28.7041,longitude=77.1025,city='Delhi',     state='Delhi',      country='IN' WHERE id=3;
UPDATE products SET latitude=13.0827,longitude=80.2707,city='Chennai',   state='Tamil Nadu', country='IN' WHERE id=4;
UPDATE products SET latitude=17.3850,longitude=78.4867,city='Hyderabad', state='Telangana',  country='IN' WHERE id=5;
UPDATE products SET latitude=22.5726,longitude=88.3639,city='Kolkata',   state='West Bengal',country='IN' WHERE id=6;
UPDATE products SET latitude=18.5204,longitude=73.8567,city='Pune',      state='Maharashtra',country='IN' WHERE id=7;
UPDATE products SET latitude=23.0225,longitude=72.5714,city='Ahmedabad', state='Gujarat',    country='IN' WHERE id=8;
UPDATE products SET latitude=26.9124,longitude=75.7873,city='Jaipur',    state='Rajasthan',  country='IN' WHERE id=9;
UPDATE products SET latitude=30.7333,longitude=76.7794,city='Chandigarh',state='Punjab',     country='IN' WHERE id=10;
UPDATE products SET latitude=12.9716,longitude=77.5946,city='Bangalore', state='Karnataka',  country='IN' WHERE id=11;
UPDATE products SET latitude=19.0760,longitude=72.8777,city='Mumbai',    state='Maharashtra',country='IN' WHERE id=12;
UPDATE products SET latitude=13.0827,longitude=80.2707,city='Chennai',   state='Tamil Nadu', country='IN' WHERE id=13;
UPDATE products SET latitude=17.3850,longitude=78.4867,city='Hyderabad', state='Telangana',  country='IN' WHERE id=14;
UPDATE products SET latitude=18.5204,longitude=73.8567,city='Pune',      state='Maharashtra',country='IN' WHERE id=15;
UPDATE products SET latitude=28.7041,longitude=77.1025,city='Delhi',     state='Delhi',      country='IN' WHERE id=16;
UPDATE products SET latitude=22.5726,longitude=88.3639,city='Kolkata',   state='West Bengal',country='IN' WHERE id=17;
UPDATE products SET latitude=23.0225,longitude=72.5714,city='Ahmedabad', state='Gujarat',    country='IN' WHERE id=18;
UPDATE products SET latitude=26.9124,longitude=75.7873,city='Jaipur',    state='Rajasthan',  country='IN' WHERE id=19;
UPDATE products SET latitude=12.9716,longitude=77.5946,city='Bangalore', state='Karnataka',  country='IN' WHERE id=20;

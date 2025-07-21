import { editor } from "monaco-editor";

export const EDITOR_CONFIG = {
  BUILD_DELAY: 1000,
  LANGUAGE: "dbml",
  THEME: "vs-dark",
};

export const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  selectOnLineNumbers: true,
  minimap: { enabled: false },
  bracketPairColorization: { enabled: true },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  padding: { top: 10, bottom: 70 },
  suggest: {
    showFields: false,
    showFunctions: false,
  },
  wordWrap: "off",
  scrollbar: {
    vertical: "hidden",
    horizontal: "hidden",
  },
  colorDecorators: true,
};

export const StartupCode = `
//// Docs: https://dbml.dbdiagram.io/docs
//// -- LEVEL 1
//// -- Schemas, Tables and References

// Creating tables
// You can define the tables with full schema names
Table ecommerce.merchants {
  id int
  country_code int
  merchant_name varchar
  
  "created at" varchar
  admin_id int [ref: > U.id, not null]
  Indexes {
    (id, country_code) [pk]
  }
}

// If schema name is omitted, it will default to "public" schema.
Table users as U {
  id int [pk, increment] // auto-increment
  full_name varchar
  created_at timestamp
  country_code int
}

Table countries {
  code int [pk]
  name varchar
  continent_name varchar
 }

// Creating references
// You can also define relaionship separately
// > many-to-one; < one-to-many; - one-to-one; <> many-to-many
Ref: U.country_code > countries.code  
Ref: ecommerce.merchants.country_code > countries.code

//----------------------------------------------//

//// -- LEVEL 2
//// -- Adding column settings

Table ecommerce.order_items {
  order_id int [ref: > ecommerce.orders.id] // inline relationship (many-to-one)
  product_id int
  quantity int [default: 1] // default value
  Indexes {
    (order_id, product_id) [pk]
  }
}

Ref: ecommerce.order_items.product_id > ecommerce.products.id

Table ecommerce.orders {
  id int [pk] // primary key
  user_id int [not null, unique]
  status varchar
  created_at varchar [note: 'When order created'] // add column note
}

//----------------------------------------------//

//// -- Level 3 
//// -- Enum, Indexes

// Enum for 'products' table below
Enum ecommerce.products_status {
  out_of_stock
  in_stock
  running_low [note: 'less than 20'] // add column note
}

// Indexes: You can define a single or multi-column index 
Table ecommerce.products {
  id int [pk]
  name varchar
  merchant_id int [not null]
  price int
  status ecommerce.products_status
  created_at datetime [default: 'now()']
  
  Indexes {
    (merchant_id, status) [name:'product_status']
    id [unique]
  }
}

Table ecommerce.product_tags {
  id int [pk]
  name varchar
}

Table ecommerce.merchant_periods {
  id int [pk]
  merchant_id int
  country_code int
  start_date datetime
  end_date datetime
}

Ref: ecommerce.products.merchant_id > ecommerce.merchants.id // many-to-one
Ref: ecommerce.product_tags.id <> ecommerce.products.id // many-to-many
//composite foreign key
Ref: ecommerce.merchant_periods.(merchant_id, country_code) > ecommerce.merchants.(id, country_code)
Ref user_orders: ecommerce.orders.user_id > public.users.id

TableGroup ecommerce {
  ecommerce.merchants
  ecommerce.merchant_periods
  ecommerce.products
  ecommerce.product_tags
}
  `;

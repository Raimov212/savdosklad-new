--
-- PostgreSQL database dump
--

\restrict J27V7CNMXfYeScYbrsCksjD2vsJkIWKXOoaIH9QumHwxNwmgPCvGTvzPiiPUvVH

-- Dumped from database version 18.2 (Debian 18.2-1.pgdg13+1)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_migrations (
    version character varying(255) NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.app_migrations OWNER TO postgres;

--
-- Name: businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.businesses (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    name character varying(100),
    description character varying(500),
    "businessAccountNumber" character varying(20),
    balance numeric(15,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    image text DEFAULT ''::text,
    "regionId" integer,
    "districtId" integer,
    "marketId" integer,
    address text,
    "organizationId" integer
);


ALTER TABLE public.businesses OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.businesses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.businesses_id_seq OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.businesses_id_seq OWNED BY public.businesses.id;


--
-- Name: calculations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calculations (
    id integer NOT NULL,
    "businessId" integer NOT NULL,
    "totalIncome" numeric(15,2) DEFAULT 0 NOT NULL,
    "incomeTax" numeric(15,2) DEFAULT 0 NOT NULL,
    "totalExpense" numeric(15,2) DEFAULT 0 NOT NULL,
    "totalFixedCosts" numeric(15,2) DEFAULT 0 NOT NULL,
    salary numeric(15,2) DEFAULT 0 NOT NULL,
    "salaryTax" numeric(15,2) DEFAULT 0 NOT NULL,
    profit numeric(15,2) DEFAULT 0 NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "totalSale" numeric(15,2) DEFAULT 0 NOT NULL,
    "addedMoney" numeric(15,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.calculations OWNER TO postgres;

--
-- Name: calculations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calculations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calculations_id_seq OWNER TO postgres;

--
-- Name: calculations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calculations_id_seq OWNED BY public.calculations.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    "cartId" integer NOT NULL,
    "marketplaceProductId" integer CONSTRAINT "cart_items_productId_not_null" NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_items_id_seq OWNER TO postgres;

--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id integer NOT NULL,
    "customerId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carts_id_seq OWNER TO postgres;

--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    "businessId" integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    image text DEFAULT ''::text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    "businessId" integer NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    address text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "telegramUserId" bigint,
    language text DEFAULT 'uz'::text NOT NULL
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_addresses (
    id integer NOT NULL,
    "customerId" integer NOT NULL,
    title character varying(50) NOT NULL,
    address text NOT NULL,
    city character varying(100),
    district character varying(100),
    "isDefault" boolean DEFAULT false,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customer_addresses OWNER TO postgres;

--
-- Name: customer_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_addresses_id_seq OWNER TO postgres;

--
-- Name: customer_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_addresses_id_seq OWNED BY public.customer_addresses.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    "firstName" character varying(50) NOT NULL,
    "lastName" character varying(50) NOT NULL,
    "phoneNumber" text NOT NULL,
    email text,
    password text NOT NULL,
    image text DEFAULT ''::text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.districts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.districts_id_seq OWNER TO postgres;

--
-- Name: districts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.districts (
    id integer DEFAULT nextval('public.districts_id_seq'::regclass) NOT NULL,
    name character varying(100) NOT NULL,
    "regionId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.districts OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    name character varying(100),
    description character varying(200),
    value numeric(15,2) DEFAULT 0 NOT NULL,
    "businessId" integer NOT NULL,
    "totalExpenseId" integer DEFAULT 0 NOT NULL,
    "expenseDate" date DEFAULT '-infinity'::date NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: fixed_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fixed_costs (
    id integer NOT NULL,
    name character varying(50),
    description character varying(150),
    amount numeric(15,2) DEFAULT 0 NOT NULL,
    type integer DEFAULT 0 NOT NULL,
    "businessId" integer NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.fixed_costs OWNER TO postgres;

--
-- Name: fixed_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fixed_costs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fixed_costs_id_seq OWNER TO postgres;

--
-- Name: fixed_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fixed_costs_id_seq OWNED BY public.fixed_costs.id;


--
-- Name: fixed_facted_costs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fixed_facted_costs (
    id integer NOT NULL,
    "fixedCostId" integer,
    date date NOT NULL,
    amount numeric(15,2) DEFAULT 0 NOT NULL,
    "businessId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.fixed_facted_costs OWNER TO postgres;

--
-- Name: fixed_facted_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fixed_facted_costs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fixed_facted_costs_id_seq OWNER TO postgres;

--
-- Name: fixed_facted_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fixed_facted_costs_id_seq OWNED BY public.fixed_facted_costs.id;


--
-- Name: marketplace_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketplace_categories (
    id integer NOT NULL,
    "categoryId" integer,
    name character varying(255) NOT NULL,
    image text,
    "isVisible" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.marketplace_categories OWNER TO postgres;

--
-- Name: marketplace_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marketplace_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marketplace_categories_id_seq OWNER TO postgres;

--
-- Name: marketplace_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marketplace_categories_id_seq OWNED BY public.marketplace_categories.id;


--
-- Name: marketplace_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketplace_products (
    id integer NOT NULL,
    "productId" integer,
    "marketplaceCategoryId" integer,
    name character varying(255) NOT NULL,
    "shortDescription" text,
    "fullDescription" text,
    price numeric(15,2) DEFAULT 0 NOT NULL,
    discount numeric(15,2) DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    images text,
    "isVisible" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "businessId" integer
);


ALTER TABLE public.marketplace_products OWNER TO postgres;

--
-- Name: marketplace_products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marketplace_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marketplace_products_id_seq OWNER TO postgres;

--
-- Name: marketplace_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marketplace_products_id_seq OWNED BY public.marketplace_products.id;


--
-- Name: markets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.markets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.markets_id_seq OWNER TO postgres;

--
-- Name: markets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.markets (
    id integer DEFAULT nextval('public.markets_id_seq'::regclass) NOT NULL,
    name character varying(100) NOT NULL,
    address text,
    "districtId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.markets OWNER TO postgres;

--
-- Name: money; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.money (
    id integer NOT NULL,
    value numeric(15,2) DEFAULT 0 NOT NULL,
    description character varying(200),
    "amountType" integer DEFAULT 0 NOT NULL,
    "businessId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.money OWNER TO postgres;

--
-- Name: money_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.money_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.money_id_seq OWNER TO postgres;

--
-- Name: money_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.money_id_seq OWNED BY public.money.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "orgName" character varying(200) NOT NULL,
    "orgType" character varying(10) DEFAULT 'YATT'::character varying NOT NULL,
    stir character varying(9),
    logo text DEFAULT ''::text,
    "legalAddress" text,
    "phoneNumber" character varying(20),
    email character varying(100),
    "bankName" character varying(100),
    "bankAccount" character varying(25),
    mfo character varying(5),
    "regionId" integer,
    "districtId" integer,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_id_seq OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text,
    "shortDescription" character varying(100),
    "fullDescription" character varying(500),
    price numeric(15,2) DEFAULT 0 NOT NULL,
    discount numeric(15,2) DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    images text,
    barcode character varying(30),
    country character varying(30),
    "categoryId" integer NOT NULL,
    "businessId" integer NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "lokalCode" character varying(15) DEFAULT NULL::character varying
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refunds (
    id integer NOT NULL,
    description character varying(300),
    "productPrice" numeric(15,2) DEFAULT 0 NOT NULL,
    "productQuantity" integer DEFAULT 0 NOT NULL,
    "productId" integer NOT NULL,
    "businessId" integer NOT NULL,
    "totalRefundId" integer NOT NULL,
    "transactionId" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refunds OWNER TO postgres;

--
-- Name: refunds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refunds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refunds_id_seq OWNER TO postgres;

--
-- Name: refunds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refunds_id_seq OWNED BY public.refunds.id;


--
-- Name: regions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.regions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.regions_id_seq OWNER TO postgres;

--
-- Name: regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regions (
    id integer DEFAULT nextval('public.regions_id_seq'::regclass) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.regions OWNER TO postgres;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO postgres;

--
-- Name: total_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.total_expenses (
    id integer NOT NULL,
    "businessId" integer NOT NULL,
    total numeric(15,2) DEFAULT 0 NOT NULL,
    cash numeric(15,2) DEFAULT 0 NOT NULL,
    card numeric(15,2) DEFAULT 0 NOT NULL,
    description text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "createdBy" integer
);


ALTER TABLE public.total_expenses OWNER TO postgres;

--
-- Name: COLUMN total_expenses."createdBy"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.total_expenses."createdBy" IS 'The ID of the user who recorded the expense';


--
-- Name: total_expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.total_expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.total_expenses_id_seq OWNER TO postgres;

--
-- Name: total_expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.total_expenses_id_seq OWNED BY public.total_expenses.id;


--
-- Name: total_refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.total_refunds (
    id integer NOT NULL,
    description text,
    total numeric(15,2) DEFAULT 0 NOT NULL,
    cash numeric(15,2) DEFAULT 0 NOT NULL,
    card numeric(15,2) DEFAULT 0 NOT NULL,
    click numeric(15,2) DEFAULT 0 NOT NULL,
    debt numeric(15,2) DEFAULT 0 NOT NULL,
    "clientNumber" text,
    "debtLimitDate" timestamp with time zone,
    "businessId" integer NOT NULL,
    "clientId" integer,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "createdBy" integer
);


ALTER TABLE public.total_refunds OWNER TO postgres;

--
-- Name: COLUMN total_refunds."createdBy"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.total_refunds."createdBy" IS 'The ID of the user who performed the refund';


--
-- Name: total_refunds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.total_refunds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.total_refunds_id_seq OWNER TO postgres;

--
-- Name: total_refunds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.total_refunds_id_seq OWNED BY public.total_refunds.id;


--
-- Name: total_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.total_transactions (
    id integer NOT NULL,
    "clientId" integer,
    "businessId" integer NOT NULL,
    total numeric(15,2) DEFAULT 0 NOT NULL,
    cash numeric(15,2) DEFAULT 0 NOT NULL,
    card numeric(15,2) DEFAULT 0 NOT NULL,
    click numeric(15,2) DEFAULT 0 NOT NULL,
    debt numeric(15,2) DEFAULT 0 NOT NULL,
    "clientNumber" text,
    description text,
    "debtLimitDate" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "createdBy" integer
);


ALTER TABLE public.total_transactions OWNER TO postgres;

--
-- Name: COLUMN total_transactions."createdBy"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.total_transactions."createdBy" IS 'The ID of the user (admin or employee) who performed the transaction';


--
-- Name: total_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.total_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.total_transactions_id_seq OWNER TO postgres;

--
-- Name: total_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.total_transactions_id_seq OWNED BY public.total_transactions.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    description character varying(300),
    "productPrice" numeric(15,2) DEFAULT 0 NOT NULL,
    "productQuantity" integer DEFAULT 0 NOT NULL,
    "productId" integer NOT NULL,
    "businessId" integer NOT NULL,
    "totalTransactionId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: user_businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_businesses (
    user_id integer NOT NULL,
    business_id integer NOT NULL
);


ALTER TABLE public.user_businesses OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "firstName" character varying(30) NOT NULL,
    "lastName" character varying(50) NOT NULL,
    "phoneNumber" text,
    "userName" character varying(30) NOT NULL,
    password text NOT NULL,
    role integer DEFAULT 0 NOT NULL,
    "inviterCode" text,
    "offerCode" text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isExpired" boolean DEFAULT false NOT NULL,
    "telegramUserId" bigint DEFAULT 0 NOT NULL,
    "expirationDate" timestamp with time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    image text DEFAULT ''::text,
    language text DEFAULT 'uz'::text NOT NULL,
    "regionId" integer,
    "districtId" integer,
    "marketId" integer,
    "brandName" character varying(255),
    "brandImage" text,
    "createdBy" integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.role IS '0=Employee, 1=Admin, 2=SuperAdmin, 3=Client';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: businesses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses ALTER COLUMN id SET DEFAULT nextval('public.businesses_id_seq'::regclass);


--
-- Name: calculations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculations ALTER COLUMN id SET DEFAULT nextval('public.calculations_id_seq'::regclass);


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: customer_addresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses ALTER COLUMN id SET DEFAULT nextval('public.customer_addresses_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: fixed_costs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_costs ALTER COLUMN id SET DEFAULT nextval('public.fixed_costs_id_seq'::regclass);


--
-- Name: fixed_facted_costs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_facted_costs ALTER COLUMN id SET DEFAULT nextval('public.fixed_facted_costs_id_seq'::regclass);


--
-- Name: marketplace_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_categories ALTER COLUMN id SET DEFAULT nextval('public.marketplace_categories_id_seq'::regclass);


--
-- Name: marketplace_products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_products ALTER COLUMN id SET DEFAULT nextval('public.marketplace_products_id_seq'::regclass);


--
-- Name: money id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.money ALTER COLUMN id SET DEFAULT nextval('public.money_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: refunds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds ALTER COLUMN id SET DEFAULT nextval('public.refunds_id_seq'::regclass);


--
-- Name: total_expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_expenses ALTER COLUMN id SET DEFAULT nextval('public.total_expenses_id_seq'::regclass);


--
-- Name: total_refunds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_refunds ALTER COLUMN id SET DEFAULT nextval('public.total_refunds_id_seq'::regclass);


--
-- Name: total_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_transactions ALTER COLUMN id SET DEFAULT nextval('public.total_transactions_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: app_migrations app_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_migrations
    ADD CONSTRAINT app_migrations_pkey PRIMARY KEY (version);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: calculations calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculations
    ADD CONSTRAINT calculations_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_cartId_productId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_cartId_productId_key" UNIQUE ("cartId", "marketplaceProductId");


--
-- Name: cart_items cart_items_cartid_mpid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cartid_mpid_key UNIQUE ("cartId", "marketplaceProductId");


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_customerId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_customerId_key" UNIQUE ("customerId");


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: clients clients_business_phone_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_business_phone_unique UNIQUE ("businessId", phone);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customers customers_phoneNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_phoneNumber_key" UNIQUE ("phoneNumber");


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: fixed_costs fixed_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_costs
    ADD CONSTRAINT fixed_costs_pkey PRIMARY KEY (id);


--
-- Name: fixed_facted_costs fixed_facted_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_facted_costs
    ADD CONSTRAINT fixed_facted_costs_pkey PRIMARY KEY (id);


--
-- Name: marketplace_categories marketplace_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_categories
    ADD CONSTRAINT marketplace_categories_pkey PRIMARY KEY (id);


--
-- Name: marketplace_products marketplace_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_products
    ADD CONSTRAINT marketplace_products_pkey PRIMARY KEY (id);


--
-- Name: markets markets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT markets_pkey PRIMARY KEY (id);


--
-- Name: money money_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.money
    ADD CONSTRAINT money_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: total_expenses total_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_expenses
    ADD CONSTRAINT total_expenses_pkey PRIMARY KEY (id);


--
-- Name: total_refunds total_refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_refunds
    ADD CONSTRAINT total_refunds_pkey PRIMARY KEY (id);


--
-- Name: total_transactions total_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_transactions
    ADD CONSTRAINT total_transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_businesses user_businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_businesses
    ADD CONSTRAINT user_businesses_pkey PRIMARY KEY (user_id, business_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_userName_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_userName_key" UNIQUE ("userName");


--
-- Name: idx_clients_telegram_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_telegram_user_id ON public.clients USING btree ("telegramUserId");


--
-- Name: idx_products_barcode_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_products_barcode_business ON public.products USING btree (barcode, "businessId") WHERE ((barcode IS NOT NULL) AND ((barcode)::text <> ''::text) AND ("isDeleted" = false));


--
-- Name: businesses businesses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "businesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: calculations calculations_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculations
    ADD CONSTRAINT "calculations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: cart_items cart_items_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_marketplace_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_marketplace_product_fkey FOREIGN KEY ("marketplaceProductId") REFERENCES public.marketplace_products(id);


--
-- Name: cart_items cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("marketplaceProductId") REFERENCES public.products(id);


--
-- Name: carts carts_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: categories categories_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: clients clients_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT "clients_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: customer_addresses customer_addresses_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT "customer_addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: districts districts_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "districts_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: fixed_costs fixed_costs_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_costs
    ADD CONSTRAINT "fixed_costs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: fixed_facted_costs fixed_facted_costs_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_facted_costs
    ADD CONSTRAINT "fixed_facted_costs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: marketplace_categories marketplace_categories_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_categories
    ADD CONSTRAINT "marketplace_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: marketplace_products marketplace_products_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_products
    ADD CONSTRAINT "marketplace_products_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON DELETE SET NULL;


--
-- Name: marketplace_products marketplace_products_marketplaceCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_products
    ADD CONSTRAINT "marketplace_products_marketplaceCategoryId_fkey" FOREIGN KEY ("marketplaceCategoryId") REFERENCES public.marketplace_categories(id) ON DELETE SET NULL;


--
-- Name: marketplace_products marketplace_products_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_products
    ADD CONSTRAINT "marketplace_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: markets markets_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT "markets_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public.districts(id) ON DELETE CASCADE;


--
-- Name: money money_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.money
    ADD CONSTRAINT "money_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: organizations organizations_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT "organizations_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public.districts(id);


--
-- Name: organizations organizations_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT "organizations_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public.regions(id);


--
-- Name: organizations organizations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT "organizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: products products_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id);


--
-- Name: refunds refunds_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "refunds_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: refunds refunds_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "refunds_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id);


--
-- Name: refunds refunds_totalRefundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "refunds_totalRefundId_fkey" FOREIGN KEY ("totalRefundId") REFERENCES public.total_refunds(id);


--
-- Name: total_expenses total_expenses_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_expenses
    ADD CONSTRAINT "total_expenses_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: total_expenses total_expenses_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_expenses
    ADD CONSTRAINT "total_expenses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id);


--
-- Name: total_refunds total_refunds_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_refunds
    ADD CONSTRAINT "total_refunds_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: total_refunds total_refunds_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_refunds
    ADD CONSTRAINT "total_refunds_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id);


--
-- Name: total_transactions total_transactions_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_transactions
    ADD CONSTRAINT "total_transactions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: total_transactions total_transactions_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.total_transactions
    ADD CONSTRAINT "total_transactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id);


--
-- Name: transactions transactions_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);


--
-- Name: transactions transactions_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id);


--
-- Name: transactions transactions_totalTransactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_totalTransactionId_fkey" FOREIGN KEY ("totalTransactionId") REFERENCES public.total_transactions(id);


--
-- Name: user_businesses user_businesses_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_businesses
    ADD CONSTRAINT user_businesses_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: user_businesses user_businesses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_businesses
    ADD CONSTRAINT user_businesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict J27V7CNMXfYeScYbrsCksjD2vsJkIWKXOoaIH9QumHwxNwmgPCvGTvzPiiPUvVH


--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: cuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuenta (
    idcuenta integer NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.cuenta OWNER TO postgres;

--
-- Name: cuenta_idcuenta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuenta_idcuenta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuenta_idcuenta_seq OWNER TO postgres;

--
-- Name: cuenta_idcuenta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuenta_idcuenta_seq OWNED BY public.cuenta.idcuenta;


--
-- Name: registro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro (
    idregistro integer NOT NULL,
    idcuenta integer NOT NULL,
    anio integer NOT NULL,
    saldo numeric(12,2) DEFAULT 0
);


ALTER TABLE public.registro OWNER TO postgres;

--
-- Name: registro_idregistro_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registro_idregistro_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registro_idregistro_seq OWNER TO postgres;

--
-- Name: registro_idregistro_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registro_idregistro_seq OWNED BY public.registro.idregistro;


--
-- Name: cuenta idcuenta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta ALTER COLUMN idcuenta SET DEFAULT nextval('public.cuenta_idcuenta_seq'::regclass);


--
-- Name: registro idregistro; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro ALTER COLUMN idregistro SET DEFAULT nextval('public.registro_idregistro_seq'::regclass);


--
-- Data for Name: cuenta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuenta (idcuenta, codigo, nombre) FROM stdin;
4	1.101	Efectivos
5	1.102	Certificados de depósitos a plazo fijo
7	1.104	Cuentas por cobrar a clientes
8	1.105	Cuentas por cobrar comerciales - neto
9	1.106	Anticipos a proveedores y otras cuentas por cobrar
10	1.107	Cuentas por cobrar a partes relacionadas
11	1.108	Anticipos a obligaciones por derechos titularizados
12	1.109	Inventarios
13	1.110	Gastos pagados por anticipado
14	1.111	Anticipos al impuesto sobre la renta
15	1.112	Otras cuentas por cobrar
66	1.000000	Total activo
17	1.201	Certificados de depósitos a plazo fijo largo plazo
69	1.1000	Total activo corriente
19	1.202	Inversiones en bonos largo plazo
20	1.203	Inversiones en acciones largo plazo
21	1.204	Propiedades de inversión largo plazo 
22	1.205	Activos por derecho de uso largo plazo - neto 
23	1.206	Propiedades, planta y equipo
24	1.207	Crédito mercantil
25	1.208	Plusvalía mercantil
26	1.209	Activos intangibles
27	1.210	Otros activos
28	1.211	Activo por impuestos sobre la renta diferidos
29	2.101	Préstamos por pagar
30	2.102	Prestamos bancarios por pagar
31	2.103	Porción corriente de los préstamos por pagar a largo plazo
32	2.104	porción corriente de arrendamientos a largo plazo
33	2.105	Arrendamientos por pagar
34	2.106	Obligaciones por derechos titularizados
35	2.107	Documentos por pagar
36	2.108	Porción de los documentos por pagar a largo plazo
37	2.109	Proveedores
38	2.110	Cuentas por pagar a partes relacionadas
39	2.111	Impuesto sobre la renta por pagar
40	2.112	Otras cuentas y gastos acumulados por pagar
41	2.113	Otras cuentas por pagar
42	2.201	Préstamos por pagar a largo plazo 
2	1	Activos
44	2.202	Prestamos bancarios por pagar largo plazo
45	2.203	Arrendamientos por pagar a largo plazo
70	1.2000	Total activo no corriente
47	2.204	Obligaciones por derechos titularizados largo plazo
67	2.000000	Total pasivo
50	2.207	Provisión para indemnizaciones laborales
51	2.208	Documentos por pagar a largo plazo
52	2.209	pasivos por beneficios post empleo
53	2.210	Pasivo por impuestos diferidos
54	3.101	Capital social - acciones comunes
55	3.102	Aportaciones adicionales de capital 
56	3.103	Aportaciones de capital
57	3.104	Superávit por revaluación
58	3.105	Reserva legal
60	3.106	Efecto acumulado de conversión 
61	3.107	 Otras reservas de capital
62	3.108	Utilidades retenidas 
63	3.109	Utilidades acumuladas
64	3.110	Participaciones no controladoras
65	2.114	Cuentas por pagar comerciales
80	1.212	Cuentas por cobrar a partes relacionadas largo plazo
81	1.213	Otras cuentas por cobrar largo plazo
49	2.206	Certificados de inversión largo plazo
84	2.115	certificados de invercion
48	2.205	Bonos corporativos largo plazo
85	2.116	Bonos corporativos 
86	2.211	Otras cuentas por pagar largo plazo
89	2.212	Pasivos por prima en venta de acciones de subsidiaria
90	2.213	Impuesto sobre la renta por pagar largo plazo
92	2.214	Pasivo por impuesto sobre la renta diferido
93	3.111	Primas sobre acciones
94	1.113	inversiones
96	1.214	Cuentas por cobrar a clientes largo plazo
97	1.215	inversiones largo plazo
98	2.117	Otros pasivos financieros
99	2.216	Impuestos corrientes largo plazo
100	2.118	Impuestos corrientes
101	2.217	Otros pasivos financieros largo plazo
102	2.218	Provisiones 
103	3.112	Reservas de capital
104	3.113	Resultados del periodo
73	4.201	Gastos administrativos
74	4.202	Gastos de venta
71	5.101	Ingresos por ventas
76	5.102	Otros ingresos y gastos netos
72	4.101	Costo de lo vendido
77	4.102	Provision para el impuesto sobre la renta
78	4.103	Efecto de conversion de moneda de anio
79	4.104	Provision para la aportacion solidaria
106	4.203	Gastos de Personal
107	4.204	Gastos de Depreciación y Amortización
75	4.210	Ingresos (gastos) financieros, netos
110	4.209	Otros Ingresos (Gastos)
109	4.208	Gastos Financieros
108	4.207	Ingresos Financieros
111	4.205	Perdidas por deterioro de valor de cuentas por cobrar
95	1.116	Activos por impuestos corrientes
68	3	PATRIMONIO
113	4	Costos y gastos
114	5	Ingresos
117	6.101	Arrendamientos pagados
116	6.102	Prestamos Bancarios Pagados
119	6.103	Documentos por pagar pagados
120	6.104	Obligaciones por derechos titularizados pagados
105	2.119	Acreedores comerciales y otras cuentas por pagar
6	1.103	Inversiones en bonos
\.


--
-- Data for Name: registro; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registro (idregistro, idcuenta, anio, saldo) FROM stdin;
2525	66	2026	0.00
14	4	2020	11003092.00
15	4	2021	10840865.00
16	5	2020	2000000.00
18	6	2021	2000000.00
19	7	2020	35880752.00
20	8	2021	53081088.00
21	9	2020	29195514.00
22	10	2020	36887954.00
23	10	2021	75454125.00
24	11	2020	924000.00
25	12	2020	67104924.00
26	12	2021	148440504.00
27	13	2020	1977809.00
28	13	2021	1538667.00
29	14	2021	1723211.00
30	15	2021	64903087.00
31	17	2020	1000000.00
32	17	2021	1000000.00
33	19	2020	2000000.00
34	20	2020	23400407.00
35	20	2021	24950870.00
36	21	2020	7044402.00
37	21	2021	5597009.00
38	22	2021	16702267.00
39	23	2020	72739147.00
40	23	2021	106623719.00
41	24	2020	12863100.00
42	25	2021	11668154.00
43	26	2020	3398176.00
44	26	2021	2585345.00
46	27	2021	299603.00
47	28	2021	646671.00
48	29	2020	12037075.00
49	30	2021	25039997.00
50	31	2020	17969367.00
51	32	2020	2324490.00
52	33	2021	4872937.00
53	34	2020	1515530.00
54	34	2021	1652870.00
55	35	2020	3130000.00
56	36	2021	80133.00
57	37	2020	78240283.00
58	65	2021	156609253.00
59	38	2020	19478631.00
60	38	2021	1171548.00
61	39	2020	2580572.00
66	41	2021	8632737.00
67	42	2020	88462039.00
68	44	2021	114626074.00
69	45	2020	4853707.00
70	45	2021	24556484.00
71	47	2020	13180143.00
72	47	2021	10847273.00
73	48	2021	32758231.00
74	49	2021	18271064.00
75	50	2020	629675.00
76	51	2021	186964.00
77	52	2021	592568.00
79	54	2020	25940098.00
80	54	2021	79411060.00
88	62	2020	28671386.00
82	56	2021	84787.00
83	57	2020	582144.00
84	58	2020	2013378.00
85	58	2021	4325495.00
86	60	2020	-2081126.00
87	61	2021	-1183613.00
89	64	2021	3263361.00
45	27	2020	298991.00
81	55	2020	169574.00
2549	63	2021	59420100.00
17	5	2021	25900000.00
62	39	2021	7913755.00
2554	4	2022	20155298.00
2560	8	2023	41272525.00
2566	12	2023	141491319.00
2572	17	2023	8000000.00
2578	21	2023	8325372.00
2584	26	2023	1413660.00
2590	28	2023	362138.00
2602	65	2022	96629671.00
2608	39	2022	416488.00
2614	44	2022	108327468.00
2596	49	2022	20447743.00
2626	89	2022	18771142.00
2632	92	2023	2065182.00
2644	63	2023	47852456.00
2650	94	2024	13935076.00
2662	27	2024	802225.00
2668	38	2024	2098612.00
2674	81	2024	118684551.00
2680	47	2024	68067653.00
2686	58	2024	5540907.00
2692	29	2024	95128624.00
2696	71	2024	479006719.00
2702	106	2024	-26967511.00
2543	76	2021	5560251.00
2720	110	2022	332863.00
2726	74	2023	-43950554.00
2738	119	2020	19403.00
2744	117	2022	7583466.00
2750	120	2023	1597637.00
2751	76	2020	3506676.00
2526	7	2026	10.00
2551	79	2020	-47943.00
2538	77	2020	-3530251.00
2555	4	2023	12130206.00
2561	10	2022	187750230.00
2567	13	2022	1035731.00
2573	80	2023	110380709.00
2579	23	2022	154006305.00
2585	25	2022	11668154.00
2591	30	2022	81331433.00
2603	65	2023	195599671.00
2609	39	2023	1099467.00
2615	44	2023	112597844.00
2597	49	2023	24130415.00
2621	47	2022	9029662.00
2627	89	2023	18730404.00
2639	58	2022	4694588.00
2645	64	2022	4892562.00
2633	54	2022	119389833.00
2651	10	2024	182232841.00
2657	97	2024	32166255.00
2663	28	2024	223586.00
2681	92	2024	2011899.00
2687	93	2024	56160201.00
2693	105	2024	225126517.00
2675	7	2024	1106932.00
2697	72	2024	-377459424.00
2703	107	2024	-7107482.00
2544	75	2021	-19194840.00
2715	71	2022	499653494.00
2721	109	2022	-17181342.00
2727	111	2023	-507752.00
2739	120	2020	1810802.00
2745	116	2022	96721311.00
2759	114	2025	1.00
2527	66	2020	0.00
2548	40	2020	8021302.00
2552	78	2020	-5632929.00
2556	5	2022	7000000.00
2562	10	2023	168293969.00
2568	13	2023	954879.00
2574	81	2023	924000.00
2580	23	2023	173683163.00
2586	25	2023	35293969.00
2592	30	2023	95395476.00
2598	34	2022	1817611.00
2604	38	2022	34655602.00
2610	84	2022	2745704.00
2616	45	2022	36108070.00
2622	47	2023	7454491.00
2628	52	2022	728759.00
2634	54	2023	119389833.00
2640	58	2023	5540907.00
2646	92	2021	822107.00
2652	12	2024	116761311.00
2658	21	2024	7052552.00
2682	101	2024	16811464.00
2688	103	2024	5188768.00
2694	15	2024	54824958.00
2698	73	2024	-5898635.00
2710	77	2024	-4124197.00
2539	71	2021	525873803.00
2545	77	2021	-14823585.00
2533	71	2020	291480410.00
2716	72	2022	-410331156.00
2722	77	2022	-3960325.00
2728	108	2023	3721720.00
2740	117	2021	6295586.00
2746	120	2022	1652870.00
2734	108	2020	215604.00
2563	15	2022	52441213.00
2569	14	2022	6639395.00
2575	20	2022	24658197.00
2581	22	2022	15720434.00
2587	27	2022	473223.00
2593	33	2022	5373076.00
2599	34	2023	1795145.00
2605	38	2023	4512985.00
2611	84	2023	2298539.00
2617	45	2023	33221918.00
2623	51	2022	195923.00
2629	52	2023	932485.00
2635	93	2023	56160201.00
2641	61	2022	-2360428.00
2647	56	2022	84787.00
2653	13	2024	1939012.00
2659	23	2024	179359645.00
2665	33	2024	6252051.00
2677	100	2024	1185813.00
2683	102	2024	18192624.00
2689	60	2024	-8973683.00
2695	8	2024	41272525.00
2699	74	2024	-26379749.00
2705	108	2024	15024973.00
2540	72	2021	-371741118.00
2534	72	2020	-226364119.00
2717	73	2022	-18344656.00
2723	71	2023	478623072.00
2729	109	2023	-22016927.00
2735	116	2020	143137210.00
2741	116	2021	63452712.00
2747	119	2022	86550.00
2761	7	2027	90.00
2535	73	2020	-7909279.00
2558	5	2023	7400000.00
2564	15	2023	54824958.00
2570	14	2023	3426688.00
2576	20	2023	24633711.00
2582	22	2023	15633837.00
2588	27	2023	655843.00
2594	33	2023	5406547.00
2600	36	2022	120013.00
2606	41	2022	8854582.00
2618	48	2022	32083941.00
2624	51	2023	16680822.00
2630	90	2023	465955.00
2636	93	2022	56160201.00
2642	61	2023	-1439577.00
2648	56	2023	169574.00
2654	95	2024	4916766.00
2660	22	2024	17127186.00
2666	98	2024	19727330.00
2678	44	2024	98999095.00
2684	54	2024	119391833.00
2690	63	2024	45523207.00
2706	109	2024	-43089283.00
2541	73	2021	-15547353.00
2718	74	2022	-39712552.00
2724	72	2023	-373545631.00
2730	77	2023	-9341414.00
2736	117	2020	8791750.00
2742	119	2021	1980234.00
2748	117	2023	9898101.00
2762	109	2025	3.00
2536	74	2020	-30181462.00
2559	8	2022	32581092.00
2565	12	2022	141069442.00
2571	17	2022	8000000.00
2577	21	2022	6078838.00
2583	26	2022	1923631.00
2589	28	2022	823910.00
2601	36	2023	6703817.00
2607	41	2023	12127667.00
2524	4	2026	98.00
2625	86	2023	293522.00
2631	92	2022	511441.00
2595	48	2023	31733829.00
2613	85	2023	8181371.00
2643	63	2022	31015221.00
2649	4	2024	15782257.00
2655	96	2024	983263.00
2661	26	2024	38005433.00
2667	34	2024	13447268.00
2679	45	2024	34065636.00
2685	56	2024	169574.00
2691	104	2024	3060981.00
2707	110	2024	55570.00
2542	74	2021	-42851597.00
2719	111	2022	-397016.00
2725	73	2023	-19651834.00
2731	109	2020	-16452378.00
2743	120	2021	1526271.00
2749	116	2023	149681300.00
2763	29	2025	1.00
2764	54	2025	6.00
\.


--
-- Name: cuenta_idcuenta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuenta_idcuenta_seq', 147, true);


--
-- Name: registro_idregistro_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registro_idregistro_seq', 2764, true);


--
-- Name: cuenta cuenta_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta
    ADD CONSTRAINT cuenta_codigo_key UNIQUE (codigo);


--
-- Name: cuenta cuenta_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta
    ADD CONSTRAINT cuenta_nombre_key UNIQUE (nombre);


--
-- Name: cuenta cuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta
    ADD CONSTRAINT cuenta_pkey PRIMARY KEY (idcuenta);


--
-- Name: registro registro_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro
    ADD CONSTRAINT registro_pkey PRIMARY KEY (idregistro);


--
-- Name: registro registro_unico_idcuenta_anio; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro
    ADD CONSTRAINT registro_unico_idcuenta_anio UNIQUE (idcuenta, anio);


--
-- Name: registro registro_idcuenta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro
    ADD CONSTRAINT registro_idcuenta_fkey FOREIGN KEY (idcuenta) REFERENCES public.cuenta(idcuenta) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


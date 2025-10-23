const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());
app.set('view engine', 'ejs');

const admin = require("firebase-admin");
const cors = require("cors");
app.use(cors());
app.use(express.urlencoded({extended: true}));

const serviceAccount = require ("./firebase_key.json")
admin.initializeApp({
credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.get('/productos', async (req, res) => {  
    try {
        const items = await db.collection("productos").get();
        const productos = items.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                nombre: data.nombre,
                descripcion: data.descripcion,
                precio: data.precio,
                imagen: data.imagen
            };
        });
res.render('inicio', { productos });
}catch (error) {
    res.status(500).json({ error: error.message});
}
}); 

app.listen(port, () => {
    console.log('Servidor inicializado en http://localhost:' + port + '/productos/add');
});

app.get('/productos/add', (req, res) => {
    res.render('form', { producto: null, nombre: ' Crear Producto'});
});

app.post('/productos', async (req, res) => {
    res.render('form', { producto: null, nombre: 'Crear Producto'});
});
app.post('/productos', async (req, res) => {
    try {
        const { nombre, precio, descripcion, imagen} = req.body;
        const nuevo = {
            nombre: nombre || '',
            precio: parseFloat(precio) || 0,
            descripcion,
            imagen: imagen || ''
        };
        await db.collection('productos').add(nuevo);
        res.redirect('/productos');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear producto');
    }
});
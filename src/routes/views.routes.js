import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import { UserController } from "../controllers/user.controller.js";
import productModel from "../models/product.model.js";
import messageModel from "../models/messages.model.js";

const router = Router();
const controller = new ProductController();
const userController = new UserController();

router.get("/", async (req, res) => {
  try {
    const allProducts = await productModel.find().lean().exec();
    console.log(allProducts.map((item) => item._id));
    res.render("index", { allProducts });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Dejamos esta ruta como PUBLICA, cualquier usuario logueado puede verla
router.get("/products", async (req, res) => {
  // Verificamos si hay un usuario logueado
  try {
    if (req.user) {
      const products = await controller.getProducts();
      const user = req.user;

      res.render("products", {
        title: "Lista de PRODUCTOS",
        products: products,
        userName: `Bienvenido: ${user.first_name}`,
        userRol: `Rol: ${user.rol}`,
      });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Dejamos esta ruta como PRIVADA, solo los usuarios admin pueden verla
router.get("/users", async (req, res) => {
  try {
    // Si hay un usuario logueado y es admin
    if (req.user && req.user.rol === "ADMIN") {
      const data = await userController.getUsersPaginated(
        req.query.page || 1,
        req.query.limit || 50
      );

      // Handlebars tiene algunas limitaciones al momento de evaluar expresiones.
      // Si queremos un listado completo de enlaces de página, armamos directamente un array
      // para recorrer y tener el número de página en cada caso (ver opción 1 paginado en plantilla)
      data.pages = [];
      for (let i = 1; i <= data.totalPages; i++) data.pages.push(i);

      res.render("users", {
        title: "Lista de USUARIOS",
        data: data,
      });
    } else if (req.user) {
      // Si hay un usuario logueado pero no es admin
      res.redirect("/profile");
    } else {
      // caso contrario volvemos al login
      res.redirect("/login");
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Activamos endpoints para renderizar las plantillas de prueba.
// Observar que el objeto de parámetros está vacío, no necesitamos pasar datos por el momento.
router.get("/cookies", async (req, res) => {
  res.render("cookies", {});
});

router.get("/login", async (req, res) => {
  // Si el usuario tiene sesión activa, no volvemos a mostrar el login,
  // directamente redireccionamos al perfil.
  if (req.user) {
    res.redirect("/profile");
  } else {
    res.render("login", {});
  }
});

router.get("/profile", async (req, res) => {
  // Si el usuario tiene sesión activa, mostramos su perfil
  if (req.user) {
    const user = req.user;
    res.render("profile", {
      userName: `Usuario: ${user.first_name}`,
      userRol: `Rol: ${user.rol}`,
    });
  } else {
    // sino volvemos al login
    res.redirect("/login");
  }
});

router.get("/register", async (req, res) => {
  res.render("register", {});
});

// Ruta para la página de chat
router.get("/chat", async (req, res) => {
  try {
    // Verifica si hay un usuario logueado
    if (req.user) {
      // Si hay un usuario logueado, renderiza la página de chat
      const messages = await messageModel.find().lean().exec();
      res.render("chat", { messages });
    } else {
      // Si no hay un usuario logueado, redirige al login
      res.redirect("/login");
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Rutas get, post, delete para la página de productos en tiempo real
router.get("/realTimeProducts", async (req, res) => {
  try {
    // Verificar si el usuario está logueado y tiene el rol de administrador
    if (req.user && req.user.rol === 'ADMIN') {
      const allProducts = await productModel.find().lean().exec();
      res.render("realTimeProducts", { allProducts });
    } else {
      // Si el usuario no tiene permisos, redirigir a alguna página o mostrar un mensaje de error
      res.status(403).send("Acceso no autorizado");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});
//para ver el producto nuevo refrescar pagina 
router.post("/api/products", async (req, res) => {
  const { title, description, price, thumbnail, code, category, stock } = req.body;
  const newProduct = new productModel({ title, description, price, thumbnail, code, category, stock });
  await newProduct.save();
  res.json(newProduct);
});
//para ver el producto eliminado refrescar pagina 
router.delete("/api/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    // Lógica para eliminar el producto según productId
    await productModel.findByIdAndDelete(productId);

    // Enviar una respuesta de éxito
    res.json({ status: "success", message: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
/**
 * Catálogo Premium — Estúdio 3D.
 * Adicione aqui os modelos .glb / .stl na pasta assets/models/.
 */
window.STL_CATALOG = {
  site: {
    title: "Acervo Maker 3D",
    subtitle: "Estúdio 3D • Modelos Selecionados",
    heroTitle: "Galeria 3D Interativa",
    heroDescription:
      "Clique em qualquer modelo para abrir o Estúdio 3D, girar em 360°, testar em filamento simples e baixar o arquivo pronto para impressão.",
    supportUrl: "https://wa.me/5500000000000",
  },

  auth: {
    enabled: false,
    accessCode: "STL2026",
  },

  notice: {
    enabled: false,
    badge: "",
    title: "",
    message: "",
  },

  categories: [
    { id: "all", group: "Estúdio 3D", name: "Todos os Modelos", icon: "◈" },
    { id: "personagens", group: "Categorias", name: "Personagens", icon: "⚔️" },
    { id: "criaturas", group: "Categorias", name: "Criaturas & Fantasia", icon: "🐉" },
    { id: "colecionaveis", group: "Categorias", name: "Colecionáveis", icon: "🏆" },
    { id: "funcionais", group: "Categorias", name: "Peças Funcionais", icon: "⚙️" },
  ],

  modules: [
    {
      id: "guerreira-viking",
      categoryId: "personagens",
      section: "principal",
      status: "available",
      coverImage: "assets/covers/guerreira-viking.png",
      modelUrl: "assets/models/guerreira-viking.glb",
      title: "Guerreira Viking",
      fileName: "guerreira-viking.glb",
      description:
        "Miniatura detalhada de guerreira viking com machado e armadura. Gire em 360°, inspecione a topologia e alterne entre pintura original e filamento PLA simples.",
      badge: "3D Interativo • 2,1 MB",
      tags: ["3D Interativo", "GLB", "Personagens", "FDM / Resina"],
      downloadUrl: "assets/models/guerreira-viking.glb",
    },
    {
      id: "harpia-fantasia",
      categoryId: "criaturas",
      section: "principal",
      status: "available",
      modelUrl: "assets/models/harpia.glb",
      title: "Harpia — Criatura Alada",
      fileName: "harpia.glb",
      description:
        "Escultura detalhada de Harpia com asas abertas. Gire em 360°, inspecione a malha e teste o acabamento em filamento PLA simples.",
      badge: "3D Interativo",
      tags: ["3D Interativo", "GLB", "Criaturas", "FDM / Resina"],
      downloadUrl: "assets/models/harpia.glb",
    },
  ],
};

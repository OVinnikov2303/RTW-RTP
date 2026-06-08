import {
  PrismaClient,
  ReviewStatus,
  ActivityType,
  AdminActionType,
  PaymentStatus,
  OrderStatus,
} from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding RTW-RTP database…\n")

  // ── Categories ───────────────────────────────────────────────────────────────

  const [laptops, gamingPcs, components, peripherals] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "laptops" },
      update: { image: "https://dlcdnwebimgs.asus.com/gain/87DCDC3E-F5C1-4195-915A-3251D2AB06A1/w1000/h732" },
      create: {
        name: "Ноутбуки",
        slug: "laptops",
        description: "Ультрабуки, ігрові ноутбуки та робочі станції",
        image: "https://dlcdnwebimgs.asus.com/gain/87DCDC3E-F5C1-4195-915A-3251D2AB06A1/w1000/h732",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "gaming-pcs" },
      update: { image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/desktops/alienware-desktops/alienware-aurora-r16/media-gallery/liquid/desktop-aw-r16-bk-lqd-cooling-gallery-3.psd?fmt=jpeg&wid=800&hei=600&qlt=90" },
      create: {
        name: "Ігрові ПК",
        slug: "gaming-pcs",
        description: "Готові ігрові системи та кастомні десктопи",
        image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/desktops/alienware-desktops/alienware-aurora-r16/media-gallery/liquid/desktop-aw-r16-bk-lqd-cooling-gallery-3.psd?fmt=jpeg&wid=800&hei=600&qlt=90",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "components" },
      update: { image: "https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-thumbnail-267-1.jpg" },
      create: {
        name: "Комплектуючі",
        slug: "components",
        description: "Процесори, відеокарти, оперативна пам'ять, накопичувачі та інше",
        image: "https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-thumbnail-267-1.jpg",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "peripherals" },
      update: { image: "https://cdn.shopify.com/s/files/1/0059/0630/1017/products/Keychron-Q1-Pro-QMK-VIA-wireless-custom-mechanical-keyboard-knob-75-percent-layout-full-aluminum-white-frame-for-Mac-Windows-Linux-with-RGB-backlight-hot-swappable-K-Pro-switch-red.jpg?v=1689309013" },
      create: {
        name: "Периферія",
        slug: "peripherals",
        description: "Клавіатури, миші, монітори, гарнітури",
        image: "https://cdn.shopify.com/s/files/1/0059/0630/1017/products/Keychron-Q1-Pro-QMK-VIA-wireless-custom-mechanical-keyboard-knob-75-percent-layout-full-aluminum-white-frame-for-Mac-Windows-Linux-with-RGB-backlight-hot-swappable-K-Pro-switch-red.jpg?v=1689309013",
        sortOrder: 4,
      },
    }),
  ])

  // Subcategories
  await Promise.all([
    prisma.category.upsert({
      where: { slug: "gaming-laptops" },
      update: {},
      create: {
        name: "Ігрові ноутбуки",
        slug: "gaming-laptops",
        description: "Високопродуктивні ігрові ноутбуки",
        parentId: laptops.id,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "workstation-laptops" },
      update: {},
      create: {
        name: "Робочі станції-ноутбуки",
        slug: "workstation-laptops",
        description: "Професійні ноутбуки робочого класу",
        parentId: laptops.id,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "graphics-cards" },
      update: {},
      create: {
        name: "Відеокарти",
        slug: "graphics-cards",
        description: "Дискретні відеокарти для ігор та обчислень",
        parentId: components.id,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "processors" },
      update: {},
      create: {
        name: "Процесори",
        slug: "processors",
        description: "Процесори для настільних ПК та ноутбуків",
        parentId: components.id,
        sortOrder: 2,
      },
    }),
  ])

  console.log("✅ Categories created (4 top-level + 4 subcategories)")

  // ── Users ────────────────────────────────────────────────────────────────────

  const [adminPw, userPw, buyerPw] = await Promise.all([
    bcrypt.hash("admin123", 12),
    bcrypt.hash("user1234", 12),
    bcrypt.hash("buyer5678", 12),
  ])

  const admin = await prisma.user.upsert({
    where: { email: "admin@rtw-rtp.com" },
    update: {},
    create: { name: "Admin User", email: "admin@rtw-rtp.com", password: adminPw, role: "ADMIN" },
  })

  const demoUser = await prisma.user.upsert({
    where: { email: "user@rtw-rtp.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@rtw-rtp.com",
      password: userPw,
      role: "USER",
      phone: "+1 555-0100",
      address: "123 Tech Street",
      city: "San Francisco",
      zip: "94102",
      country: "US",
    },
  })

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@rtw-rtp.com" },
    update: {},
    create: {
      name: "Alex Buyer",
      email: "buyer@rtw-rtp.com",
      password: buyerPw,
      role: "USER",
      phone: "+1 555-0200",
      address: "456 Commerce Ave",
      city: "New York",
      zip: "10001",
      country: "US",
    },
  })

  console.log("✅ Users created (admin + 2 test users)")

  // ── Products ─────────────────────────────────────────────────────────────────

  // Laptops
  const laptop1 = await prisma.product.upsert({
    where: { slug: "macbook-pro-16-m3" },
    update: {
      images: {
        deleteMany: {},
        create: [
          { url: "https://www.apple.com/v/macbook-pro/specs/c/images/specs/16-inch/macbook_pro_16_inch__cqvg4x5ohjv6_large.jpg", isPrimary: true, alt: "MacBook Pro 16 M3 Pro front" },
          { url: "https://www.apple.com/v/macbook-pro/ax/images/overview/product-viewer/pv_colors_spaceblack__dwfpyrbaf4cy_large.jpg", alt: "MacBook Pro 16 Space Black" },
        ],
      },
    },
    create: {
      name: 'MacBook Pro 16" M3 Pro',
      slug: "macbook-pro-16-m3",
      description:
        "Найпотужніший MacBook Pro в історії. Чіп M3 Pro забезпечує виняткову продуктивність для найскладніших задач.",
      price: 2499,
      comparePrice: 2699,
      cost: 1800,
      stock: 15,
      brand: "Apple",
      sku: "MBP-16-M3-PRO",
      weight: 2.15,
      dimensions: "35.57 × 24.81 × 1.68 cm",
      tags: ["laptop", "apple", "m3", "professional", "featured"],
      categoryId: laptops.id,
      featured: true,
      isNew: true,
      viewCount: 1240,
      purchaseCount: 48,
      specifications: {
        Продуктивність: {
          Процесор: "Apple M3 Pro (12 ядер)",
          "Оперативна пам'ять": "18 ГБ Unified Memory",
          Відеокарта: "18-ядерний GPU",
        },
        Накопичувач: { SSD: "512 ГБ NVMe", Розширюваність: false },
        Дисплей: {
          Діагональ: '16.2"',
          Тип: "Liquid Retina XDR",
          "Роздільна здатність": "3456 × 2234",
          "Частота оновлення": "120 Гц ProMotion",
        },
        Акумулятор: { "Час роботи": "До 22 годин", Ємність: "100 Вт·год" },
        "Зв'язок": {
          "Wi-Fi": "Wi-Fi 6E",
          Bluetooth: "5.3",
          Порти: "3× Thunderbolt 4, HDMI 2.1, SD-картка, MagSafe 3",
        },
      },
      images: {
        create: [
          { url: "https://www.apple.com/v/macbook-pro/specs/c/images/specs/16-inch/macbook_pro_16_inch__cqvg4x5ohjv6_large.jpg", isPrimary: true, alt: "MacBook Pro 16 M3 Pro front" },
          { url: "https://www.apple.com/v/macbook-pro/ax/images/overview/product-viewer/pv_colors_spaceblack__dwfpyrbaf4cy_large.jpg", alt: "MacBook Pro 16 Space Black" },
        ],
      },
      specs: {
        create: [
          { key: "Процесор", value: "Apple M3 Pro (12 ядер)", group: "Продуктивність", sortOrder: 1 },
          { key: "Оперативна пам'ять", value: "18 ГБ Unified Memory", group: "Продуктивність", sortOrder: 2 },
          { key: "Накопичувач", value: "512 ГБ SSD", group: "Накопичувач", sortOrder: 3 },
          { key: "Дисплей", value: '16.2" Liquid Retina XDR', group: "Дисплей", sortOrder: 4 },
          { key: "Акумулятор", value: "До 22 годин", group: "Акумулятор", sortOrder: 5 },
          { key: "Відеокарта", value: "18-ядерний GPU", group: "Продуктивність", sortOrder: 6 },
        ],
      },
    },
  })

  const laptop2 = await prisma.product.upsert({
    where: { slug: "dell-xps-15-oled" },
    update: {
      images: {
        deleteMany: {},
        create: [{ url: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/touch-black/notebook-xps-15-9530-t-black-gallery-1.psd?fmt=jpeg&wid=800&hei=600&qlt=90", isPrimary: true, alt: "Dell XPS 15 OLED" }],
      },
    },
    create: {
      name: "Dell XPS 15 OLED",
      slug: "dell-xps-15-oled",
      description: "Преміальний продуктивний ноутбук з вражаючим OLED-дисплеєм та процесором Intel Core i9.",
      price: 1899,
      comparePrice: 2099,
      cost: 1350,
      stock: 8,
      brand: "Dell",
      sku: "XPS-15-OLED-2024",
      weight: 1.86,
      tags: ["laptop", "dell", "oled", "professional"],
      categoryId: laptops.id,
      featured: true,
      viewCount: 890,
      purchaseCount: 31,
      specifications: {
        Продуктивність: {
          Процесор: "Intel Core i9-13900H",
          "Оперативна пам'ять": "32 ГБ DDR5-5200",
          Відеокарта: "NVIDIA RTX 4060 8 ГБ",
        },
        Дисплей: { Діагональ: '15.6"', Тип: "OLED", "Роздільна здатність": "3456 × 2160 (3.5K)", Сенсорний: false },
        Накопичувач: { SSD: "1 ТБ PCIe 4.0 NVMe" },
        Акумулятор: { "Час роботи": "До 13 годин", Ємність: "86 Вт·год" },
      },
      images: {
        create: [{ url: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/touch-black/notebook-xps-15-9530-t-black-gallery-1.psd?fmt=jpeg&wid=800&hei=600&qlt=90", isPrimary: true, alt: "Dell XPS 15 OLED" }],
      },
      specs: {
        create: [
          { key: "Процесор", value: "Intel Core i9-13900H", group: "Продуктивність", sortOrder: 1 },
          { key: "Оперативна пам'ять", value: "32 ГБ DDR5", group: "Продуктивність", sortOrder: 2 },
          { key: "Накопичувач", value: "1 ТБ NVMe SSD", group: "Накопичувач", sortOrder: 3 },
          { key: "Дисплей", value: '15.6" 3.5K OLED', group: "Дисплей", sortOrder: 4 },
          { key: "Відеокарта", value: "NVIDIA RTX 4060", group: "Продуктивність", sortOrder: 5 },
        ],
      },
    },
  })

  const laptop3 = await prisma.product.upsert({
    where: { slug: "asus-rog-zephyrus-g14" },
    update: {
      images: {
        deleteMany: {},
        create: [
          { url: "https://dlcdnwebimgs.asus.com/gain/87DCDC3E-F5C1-4195-915A-3251D2AB06A1/w1000/h732", isPrimary: true, alt: "ASUS ROG Zephyrus G14 front view" },
          { url: "https://dlcdnwebimgs.asus.com/gain/6D242E91-1127-4073-A046-2692DB8CA2D4/w1000/h732", alt: "ASUS ROG Zephyrus G14 open" },
        ],
      },
    },
    create: {
      name: "ASUS ROG Zephyrus G14",
      slug: "asus-rog-zephyrus-g14",
      description: "Найкращий ігровий ноутбук. Компактний форм-фактор із продуктивністю настільного ПК.",
      price: 1649,
      stock: 20,
      brand: "ASUS",
      sku: "ROG-ZEP-G14-2024",
      weight: 1.65,
      tags: ["laptop", "gaming", "asus", "rog", "amd"],
      categoryId: laptops.id,
      isNew: true,
      viewCount: 2100,
      purchaseCount: 76,
      specifications: {
        Продуктивність: {
          Процесор: "AMD Ryzen 9 7940HS",
          "Оперативна пам'ять": "32 ГБ DDR5",
          Відеокарта: "NVIDIA RTX 4070 8 ГБ",
        },
        Дисплей: {
          Діагональ: '14"',
          Тип: "IPS",
          "Роздільна здатність": "2560 × 1600 (QHD+)",
          "Частота оновлення": "165 Гц",
        },
        Накопичувач: { SSD: "1 ТБ PCIe 4.0 NVMe" },
        Дизайн: { Вага: "1.65 кг", "AniMe Matrix": true },
      },
      images: {
        create: [
          { url: "https://dlcdnwebimgs.asus.com/gain/87DCDC3E-F5C1-4195-915A-3251D2AB06A1/w1000/h732", isPrimary: true, alt: "ASUS ROG Zephyrus G14 front view" },
          { url: "https://dlcdnwebimgs.asus.com/gain/6D242E91-1127-4073-A046-2692DB8CA2D4/w1000/h732", alt: "ASUS ROG Zephyrus G14 open" },
        ],
      },
      specs: {
        create: [
          { key: "Процесор", value: "AMD Ryzen 9 7940HS", group: "Продуктивність", sortOrder: 1 },
          { key: "Оперативна пам'ять", value: "32 ГБ DDR5", group: "Продуктивність", sortOrder: 2 },
          { key: "Накопичувач", value: "1 ТБ NVMe SSD", group: "Накопичувач", sortOrder: 3 },
          { key: "Дисплей", value: '14" QHD+ 165Гц', group: "Дисплей", sortOrder: 4 },
          { key: "Відеокарта", value: "NVIDIA RTX 4070", group: "Продуктивність", sortOrder: 5 },
        ],
      },
    },
  })

  // Gaming PCs
  const pc1 = await prisma.product.upsert({
    where: { slug: "corsair-one-i300" },
    update: {
      images: {
        deleteMany: {},
        create: [{ url: "https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/Systems/CS-9020032-NA/Gallery/CORSAIR_ONE_i300_2022_01.webp", isPrimary: true, alt: "Corsair ONE i300" }],
      },
    },
    create: {
      name: "Corsair ONE i300",
      slug: "corsair-one-i300",
      description:
        "Компактний потужний настільний ПК з рідинним охолодженням CPU та GPU у вражаючому ITX-форматі.",
      price: 3499,
      comparePrice: 3799,
      cost: 2600,
      stock: 5,
      brand: "Corsair",
      sku: "CORS-ONE-I300",
      weight: 7.8,
      dimensions: "38 × 17.2 × 27 cm",
      tags: ["desktop", "gaming", "corsair", "itx", "liquid-cooling"],
      categoryId: gamingPcs.id,
      featured: true,
      isNew: true,
      viewCount: 3400,
      purchaseCount: 12,
      specifications: {
        Продуктивність: {
          Процесор: "Intel Core i9-13900K",
          "Оперативна пам'ять": "64 ГБ DDR5-5600",
          Відеокарта: "NVIDIA RTX 4090 24 ГБ",
        },
        Накопичувач: { SSD: "2 ТБ PCIe 4.0 NVMe" },
        Охолодження: {
          CPU: "Кастомний рідинний контур 240 мм",
          GPU: "Кастомне рідинне охолодження",
        },
        "Форм-фактор": { Тип: "Mini-ITX", Розміри: "38 × 17.2 × 27 см" },
      },
      images: {
        create: [{ url: "https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/Systems/CS-9020032-NA/Gallery/CORSAIR_ONE_i300_2022_01.webp", isPrimary: true, alt: "Corsair ONE i300" }],
      },
      specs: {
        create: [
          { key: "Процесор", value: "Intel Core i9-13900K", group: "Продуктивність", sortOrder: 1 },
          { key: "Оперативна пам'ять", value: "64 ГБ DDR5", group: "Продуктивність", sortOrder: 2 },
          { key: "Накопичувач", value: "2 ТБ NVMe SSD", group: "Накопичувач", sortOrder: 3 },
          { key: "Відеокарта", value: "NVIDIA RTX 4090", group: "Продуктивність", sortOrder: 4 },
          { key: "Охолодження", value: "Подвійне рідинне охолодження", group: "Охолодження", sortOrder: 5 },
        ],
      },
    },
  })

  await prisma.product.upsert({
    where: { slug: "alienware-aurora-r16" },
    update: {
      images: {
        deleteMany: {},
        create: [{ url: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/desktops/alienware-desktops/alienware-aurora-r16/media-gallery/liquid/desktop-aw-r16-bk-lqd-cooling-gallery-3.psd?fmt=jpeg&wid=800&hei=600&qlt=90", isPrimary: true, alt: "Alienware Aurora R16" }],
      },
    },
    create: {
      name: "Alienware Aurora R16",
      slug: "alienware-aurora-r16",
      description: "Флагманський ігровий ПК від Dell із продуктивністю нового покоління та культовим дизайном Alienware.",
      price: 2799,
      stock: 7,
      brand: "Alienware",
      sku: "AWR16-4090",
      weight: 12.3,
      tags: ["desktop", "gaming", "alienware", "dell"],
      categoryId: gamingPcs.id,
      viewCount: 1800,
      purchaseCount: 22,
      specifications: {
        Продуктивність: {
          Процесор: "Intel Core i9-14900KF",
          "Оперативна пам'ять": "32 ГБ DDR5",
          Відеокарта: "NVIDIA RTX 4080 16 ГБ",
        },
        Накопичувач: { Основний: "1 ТБ NVMe", Додатковий: "2 ТБ NVMe" },
        Корпус: { "Форм-фактор": "Mid-Tower", RGB: "AlienFX" },
      },
      images: {
        create: [{ url: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/desktops/alienware-desktops/alienware-aurora-r16/media-gallery/liquid/desktop-aw-r16-bk-lqd-cooling-gallery-3.psd?fmt=jpeg&wid=800&hei=600&qlt=90", isPrimary: true, alt: "Alienware Aurora R16" }],
      },
      specs: {
        create: [
          { key: "Процесор", value: "Intel Core i9-14900KF", group: "Продуктивність", sortOrder: 1 },
          { key: "Оперативна пам'ять", value: "32 ГБ DDR5", group: "Продуктивність", sortOrder: 2 },
          { key: "Накопичувач", value: "1 ТБ + 2 ТБ NVMe", group: "Накопичувач", sortOrder: 3 },
          { key: "Відеокарта", value: "NVIDIA RTX 4080", group: "Продуктивність", sortOrder: 4 },
        ],
      },
    },
  })

  // Components
  const gpu1 = await prisma.product.upsert({
    where: { slug: "nvidia-rtx-4090" },
    update: {
      images: {
        deleteMany: {},
        create: [
          { url: "https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-thumbnail-267-1.jpg", isPrimary: true, alt: "NVIDIA RTX 4090 front" },
          { url: "https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-thumbnail-267-2.jpg", alt: "NVIDIA RTX 4090 side" },
        ],
      },
    },
    create: {
      name: "NVIDIA GeForce RTX 4090 24GB",
      slug: "nvidia-rtx-4090",
      description: "Найшвидша споживча відеокарта в історії. Домінуйте в іграх 4K та AI-задачах.",
      price: 1599,
      comparePrice: 1799,
      cost: 950,
      stock: 3,
      brand: "NVIDIA",
      sku: "RTX-4090-24G",
      weight: 2.1,
      tags: ["gpu", "nvidia", "rtx", "gaming", "ai", "4090"],
      categoryId: components.id,
      featured: true,
      viewCount: 5600,
      purchaseCount: 19,
      specifications: {
        Відеокарта: {
          Архітектура: "Ada Lovelace",
          VRAM: "24 ГБ GDDR6X",
          "CUDA-ядра": 16384,
          "RT-ядра": "3-го покоління",
          "Tensor-ядра": "4-го покоління",
        },
        Частоти: { Базова: "2.23 ГГц", Турбо: "2.52 ГГц" },
        "Пам'ять": { "Розрядність шини": "384-біт", "Пропускна здатність": "1008 ГБ/с" },
        Живлення: { TDP: "450 Вт", "Роз'єми": "16-pin (у комплекті 4× 8-pin перехідник)" },
        Інтерфейс: {
          PCIe: "PCIe 4.0 x16",
          Виходи: "HDMI 2.1, 3× DisplayPort 1.4a",
        },
      },
      images: {
        create: [
          { url: "https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-thumbnail-267-1.jpg", isPrimary: true, alt: "NVIDIA RTX 4090 front" },
          { url: "https://images.nvidia.com/aem-dam/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-thumbnail-267-2.jpg", alt: "NVIDIA RTX 4090 side" },
        ],
      },
      specs: {
        create: [
          { key: "VRAM", value: "24 ГБ GDDR6X", group: "Пам'ять", sortOrder: 1 },
          { key: "CUDA-ядра", value: "16 384", group: "Відеокарта", sortOrder: 2 },
          { key: "Турбо-частота", value: "2.52 ГГц", group: "Частоти", sortOrder: 3 },
          { key: "TDP", value: "450 Вт", group: "Живлення", sortOrder: 4 },
          { key: "Інтерфейс", value: "PCIe 4.0 x16", group: "Інтерфейс", sortOrder: 5 },
        ],
      },
    },
  })

  const cpu1 = await prisma.product.upsert({
    where: { slug: "amd-ryzen-9-7950x" },
    update: {
      images: {
        deleteMany: {},
        create: [{ url: "https://images.unsplash.com/photo-1600348759986-dc35c2ec7743?w=800&q=80", isPrimary: true, alt: "AMD Ryzen 9 7950X processor" }],
      },
    },
    create: {
      name: "AMD Ryzen 9 7950X",
      slug: "amd-ryzen-9-7950x",
      description:
        "Флагманський настільний процесор AMD з 16 ядрами та 32 потоками для найвищої продуктивності робочої станції.",
      price: 549,
      comparePrice: 699,
      cost: 380,
      stock: 25,
      brand: "AMD",
      sku: "AMD-R9-7950X",
      weight: 0.05,
      tags: ["cpu", "amd", "ryzen", "workstation", "am5"],
      categoryId: components.id,
      viewCount: 4200,
      purchaseCount: 88,
      specifications: {
        "Конфігурація ядер": { Ядра: 16, Потоки: 32, Архітектура: "Zen 4" },
        Частоти: { Базова: "4.5 ГГц", Турбо: "5.7 ГГц" },
        "Кеш-пам'ять": { L2: "16 МБ", L3: "64 МБ" },
        Платформа: { Сокет: "AM5", TDP: "170 Вт", "Техпроцес": "TSMC 5 нм" },
        "Пам'ять": { Підтримка: "DDR5-5200", "Макс. обсяг": "128 ГБ", Канали: "Двоканальна" },
      },
      images: {
        create: [{ url: "https://images.unsplash.com/photo-1600348759986-dc35c2ec7743?w=800&q=80", isPrimary: true, alt: "AMD Ryzen 9 7950X processor" }],
      },
      specs: {
        create: [
          { key: "Ядра/Потоки", value: "16 / 32", group: "Конфігурація ядер", sortOrder: 1 },
          { key: "Базова частота", value: "4.5 ГГц", group: "Частоти", sortOrder: 2 },
          { key: "Турбо-частота", value: "5.7 ГГц", group: "Частоти", sortOrder: 3 },
          { key: "TDP", value: "170 Вт", group: "Живлення", sortOrder: 4 },
          { key: "Сокет", value: "AM5", group: "Платформа", sortOrder: 5 },
          { key: "Кеш-пам'ять", value: "64 МБ L3", group: "Кеш-пам'ять", sortOrder: 6 },
        ],
      },
    },
  })

  const ssd1 = await prisma.product.upsert({
    where: { slug: "samsung-990-pro-2tb" },
    update: {
      images: {
        deleteMany: {},
        create: [
          { url: "https://images.samsung.com/is/image/samsung/p6pim/us/mz-v9p2t0b-am/gallery/us-990pro-nvme-m2-ssd-mz-v9p2t0b-am-551141316?fmt=jpeg&wid=800&hei=600&qlt=90", isPrimary: true, alt: "Samsung 990 Pro 2TB NVMe SSD" },
          { url: "https://images.samsung.com/is/image/samsung/p6pim/us/mz-v9p2t0b-am/gallery/us-990pro-nvme-m2-ssd-mz-v9p2t0b-am-551141318?fmt=jpeg&wid=800&hei=600&qlt=90", alt: "Samsung 990 Pro 2TB angle" },
        ],
      },
    },
    create: {
      name: "Samsung 990 Pro 2TB NVMe",
      slug: "samsung-990-pro-2tb",
      description: "Надшвидкий NVMe SSD PCIe 4.0 зі швидкістю послідовного читання до 7 450 МБ/с.",
      price: 179,
      stock: 50,
      brand: "Samsung",
      sku: "SAM-990PRO-2TB",
      weight: 0.009,
      tags: ["ssd", "samsung", "nvme", "storage", "pcie4"],
      categoryId: components.id,
      isNew: true,
      viewCount: 3100,
      purchaseCount: 142,
      specifications: {
        "Об'єм": { Розмір: "2 ТБ", Відформатовано: "~1.86 ТБ" },
        Продуктивність: {
          "Послідовне читання": "7 450 МБ/с",
          "Послідовний запис": "6 900 МБ/с",
          "Випадкове читання": "1 600 тис. IOPS",
          "Випадковий запис": "1 550 тис. IOPS",
        },
        "Апаратна частина": {
          Інтерфейс: "PCIe 4.0 x4 NVMe",
          "Форм-фактор": "M.2 2280",
          NAND: "Samsung V-NAND TLC",
          Контролер: "Samsung Elpis 2",
        },
        Надійність: { MTBF: "1.5 млн годин", TBW: "1 200 ТБ", Гарантія: "5 років" },
      },
      images: {
        create: [
          { url: "https://images.samsung.com/is/image/samsung/p6pim/us/mz-v9p2t0b-am/gallery/us-990pro-nvme-m2-ssd-mz-v9p2t0b-am-551141316?fmt=jpeg&wid=800&hei=600&qlt=90", isPrimary: true, alt: "Samsung 990 Pro 2TB NVMe SSD" },
          { url: "https://images.samsung.com/is/image/samsung/p6pim/us/mz-v9p2t0b-am/gallery/us-990pro-nvme-m2-ssd-mz-v9p2t0b-am-551141318?fmt=jpeg&wid=800&hei=600&qlt=90", alt: "Samsung 990 Pro 2TB angle" },
        ],
      },
      specs: {
        create: [
          { key: "Об'єм", value: "2 ТБ", group: "Об'єм", sortOrder: 1 },
          { key: "Інтерфейс", value: "PCIe 4.0 x4", group: "Апаратна частина", sortOrder: 2 },
          { key: "Швидкість читання", value: "7 450 МБ/с", group: "Продуктивність", sortOrder: 3 },
          { key: "Швидкість запису", value: "6 900 МБ/с", group: "Продуктивність", sortOrder: 4 },
          { key: "Форм-фактор", value: "M.2 2280", group: "Апаратна частина", sortOrder: 5 },
        ],
      },
    },
  })

  // Peripherals
  const mouse1 = await prisma.product.upsert({
    where: { slug: "logitech-g-pro-x-superlight-2" },
    update: {
      images: {
        deleteMany: {},
        create: [
          { url: "https://resource.logitechg.com/w_544,h_466,ar_7:6,c_pad,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x-superlight-2/new-gallery-assets-2025/pro-x-superlight-2-mice-top-angle-white-gallery-1.png", isPrimary: true, alt: "Logitech G Pro X Superlight 2 top view" },
          { url: "https://resource.logitechg.com/w_544,h_544,ar_1,c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x-superlight-2/new-gallery-assets-2025/pro-x-superlight-2-mouse-lifestyle-gallery-2.png", alt: "Logitech G Pro X Superlight 2 lifestyle" },
        ],
      },
    },
    create: {
      name: "Logitech G Pro X Superlight 2",
      slug: "logitech-g-pro-x-superlight-2",
      description: "Надлегка бездротова ігрова миша, якою користуються кіберспортивні професіонали по всьому світу.",
      price: 159,
      comparePrice: 179,
      cost: 70,
      stock: 40,
      brand: "Logitech",
      sku: "LOG-GPRO-SL2",
      weight: 0.06,
      tags: ["mouse", "gaming", "wireless", "logitech", "esports"],
      categoryId: peripherals.id,
      featured: true,
      isNew: true,
      viewCount: 7800,
      purchaseCount: 310,
      specifications: {
        Сенсор: {
          Модель: "HERO 2 25K",
          "Діапазон DPI": "100 – 25 600",
          "Швидкість трекінгу": "500 IPS",
          Прискорення: "40G",
        },
        Дизайн: {
          Вага: "60 г (без кабелю)",
          Розміри: "125.9 × 63.5 × 40.0 мм",
          Ніжки: "100% PTFE",
        },
        "Бездротовий зв'язок": {
          Технологія: "LIGHTSPEED 2.4 ГГц",
          "Час роботи": "До 95 годин",
          Заряджання: "USB-C",
        },
        Кнопки: { Кількість: 5, Перемикачі: "Механічні, ресурс 90 млн натискань" },
      },
      images: {
        create: [
          { url: "https://resource.logitechg.com/w_544,h_466,ar_7:6,c_pad,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x-superlight-2/new-gallery-assets-2025/pro-x-superlight-2-mice-top-angle-white-gallery-1.png", isPrimary: true, alt: "Logitech G Pro X Superlight 2 top view" },
          { url: "https://resource.logitechg.com/w_544,h_544,ar_1,c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x-superlight-2/new-gallery-assets-2025/pro-x-superlight-2-mouse-lifestyle-gallery-2.png", alt: "Logitech G Pro X Superlight 2 lifestyle" },
        ],
      },
      specs: {
        create: [
          { key: "Сенсор", value: "HERO 2 25K", group: "Сенсор", sortOrder: 1 },
          { key: "Вага", value: "60 г", group: "Дизайн", sortOrder: 2 },
          { key: "Час роботи", value: "До 95 годин", group: "Бездротовий зв'язок", sortOrder: 3 },
          { key: "Діапазон DPI", value: "100 – 25 600", group: "Сенсор", sortOrder: 4 },
          { key: "Зв'язок", value: "Бездротовий LIGHTSPEED", group: "Бездротовий зв'язок", sortOrder: 5 },
        ],
      },
    },
  })

  await prisma.product.upsert({
    where: { slug: "keychron-q1-pro" },
    update: {
      images: {
        deleteMany: {},
        create: [{ url: "https://cdn.shopify.com/s/files/1/0059/0630/1017/products/Keychron-Q1-Pro-QMK-VIA-wireless-custom-mechanical-keyboard-knob-75-percent-layout-full-aluminum-white-frame-for-Mac-Windows-Linux-with-RGB-backlight-hot-swappable-K-Pro-switch-red.jpg?v=1689309013", isPrimary: true, alt: "Keychron Q1 Pro white frame" }],
      },
    },
    create: {
      name: "Keychron Q1 Pro Wireless Keyboard",
      slug: "keychron-q1-pro",
      description: "Преміальна бездротова механічна клавіатура у форматі 75% з гасket-кріпленням та гарячозамінними перемикачами.",
      price: 199,
      stock: 30,
      brand: "Keychron",
      sku: "KEY-Q1-PRO",
      weight: 1.55,
      tags: ["keyboard", "mechanical", "wireless", "keychron", "75percent"],
      categoryId: peripherals.id,
      viewCount: 4500,
      purchaseCount: 178,
      specifications: {
        Розкладка: { Розмір: "75%", Клавіші: 82, "Гаряча заміна": true },
        Перемикачі: {
          "За замовчуванням": "Keychron K Pro Red",
          "Сила натискання": "45 г",
          "Хід клавіші": "4.0 мм",
        },
        "Зв'язок": {
          Бездротовий: "Bluetooth 5.1",
          Дротовий: "USB-C",
          "Кілька пристроїв": "3 пристрої",
        },
        Акумулятор: { Ємність: "4 000 мА·год", "Час роботи": "До 300 годин (без підсвітки)" },
        Конструкція: {
          Корпус: "Анодований алюміній",
          Кріплення: "Gasket Mount",
          RGB: "Підсвітка кожної клавіші знизу",
        },
      },
      images: {
        create: [{ url: "https://cdn.shopify.com/s/files/1/0059/0630/1017/products/Keychron-Q1-Pro-QMK-VIA-wireless-custom-mechanical-keyboard-knob-75-percent-layout-full-aluminum-white-frame-for-Mac-Windows-Linux-with-RGB-backlight-hot-swappable-K-Pro-switch-red.jpg?v=1689309013", isPrimary: true, alt: "Keychron Q1 Pro white frame" }],
      },
      specs: {
        create: [
          { key: "Розкладка", value: "75%", group: "Розкладка", sortOrder: 1 },
          { key: "Перемикачі", value: "Keychron K Pro Red (гаряча заміна)", group: "Перемикачі", sortOrder: 2 },
          { key: "Зв'язок", value: "Bluetooth 5.1 / USB-C", group: "Зв'язок", sortOrder: 3 },
          { key: "Акумулятор", value: "4 000 мА·год", group: "Акумулятор", sortOrder: 4 },
          { key: "Конструкція", value: "Алюміній + Gasket Mount", group: "Конструкція", sortOrder: 5 },
        ],
      },
    },
  })

  const monitor1 = await prisma.product.upsert({
    where: { slug: "lg-ultragear-27gp950" },
    update: {
      images: {
        deleteMany: {},
        create: [
          { url: "https://media.us.lg.com/transform/ecomm-PDPGallery-1100x730/3ed53967-a516-4a2c-b4eb-d7d9a353bf3d/md08000330-large01-jpg?io=transform:fill,width:1536", isPrimary: true, alt: "LG UltraGear 27GP950 front" },
          { url: "https://media.us.lg.com/transform/ecomm-PDPGallery-1100x730/de28d864-7525-4dda-a784-a975fcd93833/md08000330-large02-jpg?io=transform:fill,width:1536", alt: "LG UltraGear 27GP950 side angle" },
        ],
      },
    },
    create: {
      name: "LG UltraGear 27GP950 4K 144Hz",
      slug: "lg-ultragear-27gp950",
      description:
        "Ігровий монітор 4K з Nano IPS дисплеєм, частотою оновлення 144 Гц та HDMI 2.1 для ігор нового покоління.",
      price: 799,
      comparePrice: 899,
      cost: 510,
      stock: 12,
      brand: "LG",
      sku: "LG-27GP950-B",
      weight: 7.1,
      tags: ["monitor", "gaming", "4k", "lg", "nano-ips", "144hz"],
      categoryId: peripherals.id,
      featured: true,
      viewCount: 6200,
      purchaseCount: 95,
      specifications: {
        Панель: { Тип: "Nano IPS", Діагональ: '27"', Вигин: "Пласка", Покриття: "Антиблікове" },
        "Роздільна здатність": { Нативна: "3840 × 2160 (4K UHD)", "Співвідношення сторін": "16:9" },
        Продуктивність: {
          "Частота оновлення": "144 Гц",
          "Час відгуку": "1 мс GtG",
          HDR: "VESA DisplayHDR 600",
          VRR: "G-Sync Compatible, FreeSync Premium Pro",
        },
        Порти: {
          HDMI: "HDMI 2.1 × 2",
          DisplayPort: "DP 1.4 × 1",
          "USB-A": "USB 3.0 × 2 (хаб)",
        },
        Ергономіка: {
          Нахил: "від -5° до 15°",
          "Регулювання висоти": "110 мм",
          Поворот: "від -20° до 20°",
          VESA: "100 × 100 мм",
        },
      },
      images: {
        create: [
          { url: "https://media.us.lg.com/transform/ecomm-PDPGallery-1100x730/3ed53967-a516-4a2c-b4eb-d7d9a353bf3d/md08000330-large01-jpg?io=transform:fill,width:1536", isPrimary: true, alt: "LG UltraGear 27GP950 front" },
          { url: "https://media.us.lg.com/transform/ecomm-PDPGallery-1100x730/de28d864-7525-4dda-a784-a975fcd93833/md08000330-large02-jpg?io=transform:fill,width:1536", alt: "LG UltraGear 27GP950 side angle" },
        ],
      },
      specs: {
        create: [
          { key: "Панель", value: "Nano IPS", group: "Панель", sortOrder: 1 },
          { key: "Роздільна здатність", value: "3840 × 2160 (4K)", group: "Роздільна здатність", sortOrder: 2 },
          { key: "Частота оновлення", value: "144 Гц", group: "Продуктивність", sortOrder: 3 },
          { key: "Час відгуку", value: "1 мс GtG", group: "Продуктивність", sortOrder: 4 },
          { key: "HDR", value: "HDR600", group: "Продуктивність", sortOrder: 5 },
          { key: "Порти", value: "HDMI 2.1 × 2, DP 1.4, USB-A × 2", group: "Порти", sortOrder: 6 },
        ],
      },
    },
  })

  console.log("✅ Products created (12 products with full specs + JSON specifications)")

  // ── Product Compatibility ─────────────────────────────────────────────────────

  await Promise.all([
    prisma.productCompatibility.upsert({
      where: { sourceId_targetId: { sourceId: gpu1.id, targetId: pc1.id } },
      update: {},
      create: {
        sourceId: gpu1.id,
        targetId: pc1.id,
        note: "RTX 4090 comes pre-installed in Corsair ONE i300",
      },
    }),
    prisma.productCompatibility.upsert({
      where: { sourceId_targetId: { sourceId: cpu1.id, targetId: ssd1.id } },
      update: {},
      create: {
        sourceId: cpu1.id,
        targetId: ssd1.id,
        note: "AM5 platform fully supports PCIe 4.0 NVMe drives",
      },
    }),
    prisma.productCompatibility.upsert({
      where: { sourceId_targetId: { sourceId: monitor1.id, targetId: gpu1.id } },
      update: {},
      create: {
        sourceId: monitor1.id,
        targetId: gpu1.id,
        note: "HDMI 2.1 on monitor matches RTX 4090 output — ideal 4K 144Hz pairing",
      },
    }),
    prisma.productCompatibility.upsert({
      where: { sourceId_targetId: { sourceId: laptop3.id, targetId: mouse1.id } },
      update: {},
      create: {
        sourceId: laptop3.id,
        targetId: mouse1.id,
        note: "Recommended peripheral pairing for portable gaming setup",
      },
    }),
  ])

  console.log("✅ Product compatibility links created")

  // ── Discounts ─────────────────────────────────────────────────────────────────

  await Promise.all([
    prisma.discount.upsert({
      where: { code: "WELCOME10" },
      update: {},
      create: {
        code: "WELCOME10",
        description: "10% off for new customers",
        type: "PERCENTAGE",
        value: 10,
        isActive: true,
      },
    }),
    prisma.discount.upsert({
      where: { code: "SAVE50" },
      update: {},
      create: {
        code: "SAVE50",
        description: "$50 off orders over $500",
        type: "FIXED",
        value: 50,
        minOrder: 500,
        isActive: true,
      },
    }),
    prisma.discount.upsert({
      where: { code: "SUMMER25" },
      update: {},
      create: {
        code: "SUMMER25",
        description: "Summer sale – 25% off everything",
        type: "PERCENTAGE",
        value: 25,
        maxUses: 100,
        expiresAt: new Date("2026-08-31T23:59:59Z"),
        isActive: true,
      },
    }),
    prisma.discount.upsert({
      where: { code: "FLASH15" },
      update: {},
      create: {
        code: "FLASH15",
        description: "Flash sale – 15% off (expired)",
        type: "PERCENTAGE",
        value: 15,
        expiresAt: new Date("2026-01-01T00:00:00Z"),
        isActive: false,
      },
    }),
  ])

  console.log("✅ Discount codes created (WELCOME10 | SAVE50 | SUMMER25 | FLASH15)")

  // ── Sample Orders ─────────────────────────────────────────────────────────────

  const order1 = await prisma.order.create({
    data: {
      userId: demoUser.id,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "Credit Card",
      paymentRef: "PAY_demo_001",
      subtotal: 2499,
      discountAmount: 0,
      total: 2499,
      trackingNumber: "1Z999AA10123456784",
      shippingMethod: "UPS Ground",
      shippingName: "Demo User",
      shippingEmail: "user@rtw-rtp.com",
      shippingPhone: "+1 555-0100",
      shippingAddress: "123 Tech Street",
      shippingCity: "San Francisco",
      shippingZip: "94102",
      shippingCountry: "US",
      items: {
        create: [{ productId: laptop1.id, quantity: 1, price: 2499 }],
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      userId: buyer.id,
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "PayPal",
      paymentRef: "PAY_buyer_002",
      subtotal: 1316,
      discountAmount: 50,
      total: 1266,
      shippingMethod: "FedEx Express",
      shippingName: "Alex Buyer",
      shippingEmail: "buyer@rtw-rtp.com",
      shippingPhone: "+1 555-0200",
      shippingAddress: "456 Commerce Ave",
      shippingCity: "New York",
      shippingZip: "10001",
      shippingCountry: "US",
      notes: "Please leave at front door",
      items: {
        create: [
          { productId: ssd1.id, quantity: 2, price: 179 },
          { productId: mouse1.id, quantity: 1, price: 159 },
          { productId: laptop2.id, quantity: 1, price: 799 },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      userId: demoUser.id,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: "Bank Transfer",
      subtotal: 1599,
      discountAmount: 0,
      total: 1599,
      shippingName: "Demo User",
      shippingEmail: "user@rtw-rtp.com",
      shippingAddress: "123 Tech Street",
      shippingCity: "San Francisco",
      shippingZip: "94102",
      shippingCountry: "US",
      items: {
        create: [{ productId: gpu1.id, quantity: 1, price: 1599 }],
      },
    },
  })

  // Update purchase counts to reflect orders
  await Promise.all([
    prisma.product.update({ where: { id: laptop1.id }, data: { purchaseCount: { increment: 1 } } }),
    prisma.product.update({ where: { id: ssd1.id }, data: { purchaseCount: { increment: 2 } } }),
    prisma.product.update({ where: { id: mouse1.id }, data: { purchaseCount: { increment: 1 } } }),
  ])

  console.log("✅ Sample orders created (3 orders, various statuses)")

  // ── Reviews ───────────────────────────────────────────────────────────────────

  await prisma.review.upsert({
    where: { userId_productId: { userId: demoUser.id, productId: laptop1.id } },
    update: {},
    create: {
      userId: demoUser.id,
      productId: laptop1.id,
      rating: 5,
      title: "Absolutely worth every penny",
      comment:
        "The M3 Pro chip is incredibly fast. Battery life is amazing and the display is the best I've seen on any laptop. Highly recommend for any professional.",
      status: ReviewStatus.APPROVED,
      isVerified: true,
      helpfulCount: 24,
      moderatedAt: new Date(),
      moderatedById: admin.id,
    },
  })

  await prisma.review.upsert({
    where: { userId_productId: { userId: admin.id, productId: monitor1.id } },
    update: {},
    create: {
      userId: admin.id,
      productId: monitor1.id,
      rating: 4,
      title: "Excellent 4K gaming monitor",
      comment:
        "Colors are vibrant, response time is excellent. HDMI 2.1 makes it perfect for PS5 and RTX 4090. Minor backlight bleed in corners but barely noticeable.",
      status: ReviewStatus.APPROVED,
      isVerified: false,
      helpfulCount: 12,
      moderatedAt: new Date(),
      moderatedById: admin.id,
    },
  })

  await prisma.review.upsert({
    where: { userId_productId: { userId: buyer.id, productId: ssd1.id } },
    update: {},
    create: {
      userId: buyer.id,
      productId: ssd1.id,
      rating: 5,
      title: "Fastest SSD I've ever owned",
      comment: "Insane read/write speeds, boots Windows in under 5 seconds. Highly recommend for any build.",
      status: ReviewStatus.PENDING,
      isVerified: true,
    },
  })

  await prisma.review.upsert({
    where: { userId_productId: { userId: demoUser.id, productId: mouse1.id } },
    update: {},
    create: {
      userId: demoUser.id,
      productId: mouse1.id,
      rating: 2,
      title: "Battery died after 3 months",
      comment: "Great sensor but my unit had battery issues early on. Customer support helped but disappointing.",
      status: ReviewStatus.REJECTED,
      isVerified: false,
      moderatedAt: new Date(),
      moderatedById: admin.id,
    },
  })

  // Standalone ratings (no written review)
  await Promise.all([
    prisma.rating.upsert({
      where: { userId_productId: { userId: buyer.id, productId: mouse1.id } },
      update: {},
      create: { userId: buyer.id, productId: mouse1.id, value: 5 },
    }),
    prisma.rating.upsert({
      where: { userId_productId: { userId: demoUser.id, productId: gpu1.id } },
      update: {},
      create: { userId: demoUser.id, productId: gpu1.id, value: 5 },
    }),
    prisma.rating.upsert({
      where: { userId_productId: { userId: admin.id, productId: cpu1.id } },
      update: {},
      create: { userId: admin.id, productId: cpu1.id, value: 4 },
    }),
    prisma.rating.upsert({
      where: { userId_productId: { userId: buyer.id, productId: laptop3.id } },
      update: {},
      create: { userId: buyer.id, productId: laptop3.id, value: 4 },
    }),
  ])

  console.log("✅ Reviews (approved/pending/rejected) and standalone ratings created")

  // ── User Activity ─────────────────────────────────────────────────────────────

  await Promise.all([
    prisma.userActivity.create({
      data: {
        userId: demoUser.id,
        type: ActivityType.LOGIN,
        data: { method: "email" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: demoUser.id,
        type: ActivityType.VIEW_PRODUCT,
        productId: laptop1.id,
        data: { referrer: "/products", timeOnPage: 42 },
        ipAddress: "192.168.1.1",
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: demoUser.id,
        type: ActivityType.ADD_TO_CART,
        productId: laptop1.id,
        data: { quantity: 1 },
        ipAddress: "192.168.1.1",
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: demoUser.id,
        type: ActivityType.PLACE_ORDER,
        orderId: order1.id,
        data: { total: 2499, itemCount: 1 },
        ipAddress: "192.168.1.1",
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: demoUser.id,
        type: ActivityType.WRITE_REVIEW,
        productId: laptop1.id,
        data: { rating: 5 },
        ipAddress: "192.168.1.1",
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: buyer.id,
        type: ActivityType.LOGIN,
        data: { method: "google" },
        ipAddress: "10.0.1.50",
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: buyer.id,
        type: ActivityType.SEARCH,
        data: { query: "4k gaming monitor", results: 3 },
        ipAddress: "10.0.1.50",
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: buyer.id,
        type: ActivityType.VIEW_PRODUCT,
        productId: monitor1.id,
        data: { referrer: "/search", timeOnPage: 98 },
        ipAddress: "10.0.1.50",
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: buyer.id,
        type: ActivityType.ADD_TO_WISHLIST,
        productId: gpu1.id,
        ipAddress: "10.0.1.50",
      },
    }),
    prisma.userActivity.create({
      data: {
        userId: buyer.id,
        type: ActivityType.PLACE_ORDER,
        orderId: order2.id,
        data: { total: 1266, itemCount: 4 },
        ipAddress: "10.0.1.50",
      },
    }),
  ])

  console.log("✅ User activity history created")

  // ── Admin Logs ────────────────────────────────────────────────────────────────

  const firstReview = await prisma.review.findFirst({ where: { userId: demoUser.id } })

  await Promise.all([
    prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: AdminActionType.VIEW_DASHBOARD,
        ipAddress: "10.0.0.1",
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: AdminActionType.APPROVE_REVIEW,
        entityType: "Review",
        entityId: firstReview?.id,
        before: { status: "PENDING" },
        after: { status: "APPROVED" },
        ipAddress: "10.0.0.1",
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: AdminActionType.REJECT_REVIEW,
        entityType: "Review",
        entityId: (await prisma.review.findFirst({ where: { status: "REJECTED" } }))?.id,
        before: { status: "PENDING" },
        after: { status: "REJECTED", reason: "Low quality / no useful information" },
        ipAddress: "10.0.0.1",
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: AdminActionType.CREATE_DISCOUNT,
        entityType: "Discount",
        after: { code: "SUMMER25", type: "PERCENTAGE", value: 25 },
        ipAddress: "10.0.0.1",
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: AdminActionType.UPDATE_ORDER_STATUS,
        entityType: "Order",
        entityId: order1.id,
        before: { status: "SHIPPED" },
        after: { status: "DELIVERED" },
        ipAddress: "10.0.0.1",
      },
    }),
  ])

  console.log("✅ Admin audit logs created")

  // ── Wishlist & Comparison samples ─────────────────────────────────────────────

  await Promise.all([
    prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: buyer.id, productId: gpu1.id } },
      update: {},
      create: { userId: buyer.id, productId: gpu1.id },
    }),
    prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: demoUser.id, productId: pc1.id } },
      update: {},
      create: { userId: demoUser.id, productId: pc1.id },
    }),
    prisma.comparisonItem.upsert({
      where: { userId_productId: { userId: demoUser.id, productId: laptop1.id } },
      update: {},
      create: { userId: demoUser.id, productId: laptop1.id },
    }),
    prisma.comparisonItem.upsert({
      where: { userId_productId: { userId: demoUser.id, productId: laptop2.id } },
      update: {},
      create: { userId: demoUser.id, productId: laptop2.id },
    }),
    prisma.comparisonItem.upsert({
      where: { userId_productId: { userId: demoUser.id, productId: laptop3.id } },
      update: {},
      create: { userId: demoUser.id, productId: laptop3.id },
    }),
  ])

  console.log("✅ Wishlist and comparison items created")

  // ── Test Payment Product ──────────────────────────────────────────────────────

  const testCategory = await prisma.category.upsert({
    where: { slug: "test-products" },
    update: {},
    create: {
      name: "Test Products",
      slug: "test-products",
      description: "Тестові товари для перевірки платіжної системи",
      image: "https://picsum.photos/seed/test-cat/400/300",
      sortOrder: 99,
    },
  })

  await prisma.product.upsert({
    where: { slug: "rtw-rtp-test-payment-product" },
    update: {
      images: {
        deleteMany: {},
        create: [{ url: "https://images.unsplash.com/photo-1555693659-8a5096d6faf5?w=800&q=80", isPrimary: true, alt: "Гривні — банкноти НБУ", sortOrder: 0 }],
      },
    },
    create: {
      name: "RTW-RTP Test Payment Product",
      slug: "rtw-rtp-test-payment-product",
      description:
        "Це спеціальний тестовий товар для перевірки інтеграції платіжної системи Monobank. " +
        "Ціна: 1 ₴. Використовуйте цей товар для тестування повного платіжного процесу: " +
        "додайте до кошика, перейдіть до оформлення та оплатіть через Monobank Acquiring. " +
        "НЕ ПРИЗНАЧЕНИЙ ДЛЯ РЕАЛЬНОГО ПРОДАЖУ.",
      price: 1,
      stock: 9999,
      sku: "TEST-PAY-001",
      brand: "RTW-RTP",
      tags: ["test", "payment", "monobank", "1uah"],
      categoryId: testCategory.id,
      featured: false,
      isNew: false,
      isActive: true,
      viewCount: 0,
      purchaseCount: 0,
      specifications: {
        Призначення: {
          Тип: "Тестовий товар",
          "Платіжна система": "Monobank Acquiring",
          Валюта: "UAH (гривня)",
        },
        Ціна: {
          Вартість: "1 ₴",
          "Сума в копійках": "100",
          "ISO 4217": "980 (UAH)",
        },
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1555693659-8a5096d6faf5?w=800&q=80",
            alt: "Гривні — банкноти НБУ",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      specs: {
        create: [
          { key: "Тип", value: "Тестовий товар", group: "Призначення", sortOrder: 1 },
          { key: "Платіжна система", value: "Monobank Acquiring", group: "Призначення", sortOrder: 2 },
          { key: "Ціна", value: "1 ₴ (100 копійок)", group: "Оплата", sortOrder: 3 },
          { key: "Валюта", value: "UAH / ₴ / ISO 980", group: "Оплата", sortOrder: 4 },
          { key: "Наявність", value: "Необмежено (тест)", group: "Склад", sortOrder: 5 },
        ],
      },
    },
  })

  console.log("✅ Test payment product created (1 ₴ — RTW-RTP Test Payment Product)")

  // ── Summary ───────────────────────────────────────────────────────────────────

  console.log("\n🎉 Seeding complete!\n")
  console.log("Test accounts:")
  console.log("  Admin:  admin@rtw-rtp.com  / admin123")
  console.log("  User:   user@rtw-rtp.com   / user1234")
  console.log("  Buyer:  buyer@rtw-rtp.com  / buyer5678")
  console.log("\nPromo codes:  WELCOME10 (10%) | SAVE50 ($50 off $500+) | SUMMER25 (25%)")
  console.log("\nTest payment product: /products/rtw-rtp-test-payment-product (1 ₴)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

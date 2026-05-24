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
      update: {},
      create: {
        name: "Laptops",
        slug: "laptops",
        description: "Ultrabooks, gaming laptops, and workstations",
        image: "https://picsum.photos/seed/laptops/400/300",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "gaming-pcs" },
      update: {},
      create: {
        name: "Gaming PCs",
        slug: "gaming-pcs",
        description: "Pre-built rigs and custom desktops",
        image: "https://picsum.photos/seed/gaming/400/300",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "components" },
      update: {},
      create: {
        name: "Components",
        slug: "components",
        description: "CPUs, GPUs, RAM, storage and more",
        image: "https://picsum.photos/seed/components/400/300",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "peripherals" },
      update: {},
      create: {
        name: "Peripherals",
        slug: "peripherals",
        description: "Keyboards, mice, monitors, headsets",
        image: "https://picsum.photos/seed/peripherals/400/300",
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
        name: "Gaming Laptops",
        slug: "gaming-laptops",
        description: "High-performance gaming laptops",
        parentId: laptops.id,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "workstation-laptops" },
      update: {},
      create: {
        name: "Workstation Laptops",
        slug: "workstation-laptops",
        description: "Professional workstation-class laptops",
        parentId: laptops.id,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "graphics-cards" },
      update: {},
      create: {
        name: "Graphics Cards",
        slug: "graphics-cards",
        description: "Discrete GPUs for gaming and compute",
        parentId: components.id,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "processors" },
      update: {},
      create: {
        name: "Processors",
        slug: "processors",
        description: "Desktop and laptop CPUs",
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
    update: {},
    create: {
      name: 'MacBook Pro 16" M3 Pro',
      slug: "macbook-pro-16-m3",
      description:
        "The most powerful MacBook Pro ever. M3 Pro chip delivers exceptional performance for demanding workflows.",
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
        Performance: {
          Processor: "Apple M3 Pro (12-core)",
          RAM: "18 GB Unified Memory",
          GPU: "18-core GPU",
        },
        Storage: { SSD: "512 GB NVMe", Expandable: false },
        Display: {
          Size: '16.2"',
          Type: "Liquid Retina XDR",
          Resolution: "3456 × 2234",
          "Refresh Rate": "120 Hz ProMotion",
        },
        Battery: { Life: "Up to 22 hours", Capacity: "100Wh" },
        Connectivity: {
          WiFi: "Wi-Fi 6E",
          Bluetooth: "5.3",
          Ports: "3× Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3",
        },
      },
      images: {
        create: [
          { url: "https://picsum.photos/seed/mbp16/600/600", isPrimary: true, alt: "MacBook Pro 16 M3 Pro front" },
          { url: "https://picsum.photos/seed/mbp16b/600/600", alt: "MacBook Pro 16 M3 Pro side" },
        ],
      },
      specs: {
        create: [
          { key: "Processor", value: "Apple M3 Pro (12-core)", group: "Performance", sortOrder: 1 },
          { key: "RAM", value: "18 GB Unified Memory", group: "Performance", sortOrder: 2 },
          { key: "Storage", value: "512 GB SSD", group: "Storage", sortOrder: 3 },
          { key: "Display", value: '16.2" Liquid Retina XDR', group: "Display", sortOrder: 4 },
          { key: "Battery", value: "Up to 22 hours", group: "Battery", sortOrder: 5 },
          { key: "GPU", value: "18-core GPU", group: "Performance", sortOrder: 6 },
        ],
      },
    },
  })

  const laptop2 = await prisma.product.upsert({
    where: { slug: "dell-xps-15-oled" },
    update: {},
    create: {
      name: "Dell XPS 15 OLED",
      slug: "dell-xps-15-oled",
      description: "Premium performance laptop with stunning OLED display and Intel Core i9 processor.",
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
        Performance: {
          Processor: "Intel Core i9-13900H",
          RAM: "32 GB DDR5-5200",
          GPU: "NVIDIA RTX 4060 8GB",
        },
        Display: { Size: '15.6"', Type: "OLED", Resolution: "3456 × 2160 (3.5K)", Touch: false },
        Storage: { SSD: "1 TB PCIe 4.0 NVMe" },
        Battery: { Life: "Up to 13 hours", Capacity: "86Wh" },
      },
      images: {
        create: [{ url: "https://picsum.photos/seed/xps15/600/600", isPrimary: true, alt: "Dell XPS 15 OLED" }],
      },
      specs: {
        create: [
          { key: "Processor", value: "Intel Core i9-13900H", group: "Performance", sortOrder: 1 },
          { key: "RAM", value: "32 GB DDR5", group: "Performance", sortOrder: 2 },
          { key: "Storage", value: "1 TB NVMe SSD", group: "Storage", sortOrder: 3 },
          { key: "Display", value: '15.6" 3.5K OLED', group: "Display", sortOrder: 4 },
          { key: "GPU", value: "NVIDIA RTX 4060", group: "Performance", sortOrder: 5 },
        ],
      },
    },
  })

  const laptop3 = await prisma.product.upsert({
    where: { slug: "asus-rog-zephyrus-g14" },
    update: {},
    create: {
      name: "ASUS ROG Zephyrus G14",
      slug: "asus-rog-zephyrus-g14",
      description: "The ultimate gaming laptop. Compact form factor with desktop-class performance.",
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
        Performance: {
          Processor: "AMD Ryzen 9 7940HS",
          RAM: "32 GB DDR5",
          GPU: "NVIDIA RTX 4070 8GB",
        },
        Display: {
          Size: '14"',
          Type: "IPS",
          Resolution: "2560 × 1600 (QHD+)",
          "Refresh Rate": "165 Hz",
        },
        Storage: { SSD: "1 TB PCIe 4.0 NVMe" },
        Design: { Weight: "1.65 kg", "AniMe Matrix": true },
      },
      images: {
        create: [{ url: "https://picsum.photos/seed/rogzeph/600/600", isPrimary: true, alt: "ASUS ROG Zephyrus G14" }],
      },
      specs: {
        create: [
          { key: "Processor", value: "AMD Ryzen 9 7940HS", group: "Performance", sortOrder: 1 },
          { key: "RAM", value: "32 GB DDR5", group: "Performance", sortOrder: 2 },
          { key: "Storage", value: "1 TB NVMe SSD", group: "Storage", sortOrder: 3 },
          { key: "Display", value: '14" QHD+ 165Hz', group: "Display", sortOrder: 4 },
          { key: "GPU", value: "NVIDIA RTX 4070", group: "Performance", sortOrder: 5 },
        ],
      },
    },
  })

  // Gaming PCs
  const pc1 = await prisma.product.upsert({
    where: { slug: "corsair-one-i300" },
    update: {},
    create: {
      name: "Corsair ONE i300",
      slug: "corsair-one-i300",
      description:
        "Compact powerhouse desktop PC with liquid-cooled CPU and GPU in a stunning ITX form factor.",
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
        Performance: {
          Processor: "Intel Core i9-13900K",
          RAM: "64 GB DDR5-5600",
          GPU: "NVIDIA RTX 4090 24GB",
        },
        Storage: { SSD: "2 TB PCIe 4.0 NVMe" },
        Cooling: {
          CPU: "240mm Custom Liquid Loop",
          GPU: "Custom Liquid Cooled",
        },
        "Form Factor": { Type: "Mini-ITX", Dimensions: "38 × 17.2 × 27 cm" },
      },
      images: {
        create: [{ url: "https://picsum.photos/seed/corsairone/600/600", isPrimary: true, alt: "Corsair ONE i300" }],
      },
      specs: {
        create: [
          { key: "Processor", value: "Intel Core i9-13900K", group: "Performance", sortOrder: 1 },
          { key: "RAM", value: "64 GB DDR5", group: "Performance", sortOrder: 2 },
          { key: "Storage", value: "2 TB NVMe SSD", group: "Storage", sortOrder: 3 },
          { key: "GPU", value: "NVIDIA RTX 4090", group: "Performance", sortOrder: 4 },
          { key: "Cooling", value: "Dual liquid cooling", group: "Cooling", sortOrder: 5 },
        ],
      },
    },
  })

  await prisma.product.upsert({
    where: { slug: "alienware-aurora-r16" },
    update: {},
    create: {
      name: "Alienware Aurora R16",
      slug: "alienware-aurora-r16",
      description: "Dell's flagship gaming desktop with next-gen performance and iconic Alienware design.",
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
        Performance: {
          Processor: "Intel Core i9-14900KF",
          RAM: "32 GB DDR5",
          GPU: "NVIDIA RTX 4080 16GB",
        },
        Storage: { Primary: "1 TB NVMe", Secondary: "2 TB NVMe" },
        Chassis: { "Form Factor": "Mid-Tower", RGB: "AlienFX" },
      },
      images: {
        create: [{ url: "https://picsum.photos/seed/alienware/600/600", isPrimary: true, alt: "Alienware Aurora R16" }],
      },
      specs: {
        create: [
          { key: "Processor", value: "Intel Core i9-14900KF", group: "Performance", sortOrder: 1 },
          { key: "RAM", value: "32 GB DDR5", group: "Performance", sortOrder: 2 },
          { key: "Storage", value: "1 TB + 2 TB NVMe", group: "Storage", sortOrder: 3 },
          { key: "GPU", value: "NVIDIA RTX 4080", group: "Performance", sortOrder: 4 },
        ],
      },
    },
  })

  // Components
  const gpu1 = await prisma.product.upsert({
    where: { slug: "nvidia-rtx-4090" },
    update: {},
    create: {
      name: "NVIDIA GeForce RTX 4090 24GB",
      slug: "nvidia-rtx-4090",
      description: "The fastest consumer GPU ever made. Dominate 4K gaming and AI workloads.",
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
        GPU: {
          Architecture: "Ada Lovelace",
          VRAM: "24 GB GDDR6X",
          "CUDA Cores": 16384,
          "RT Cores": "3rd Gen",
          "Tensor Cores": "4th Gen",
        },
        Clocks: { Base: "2.23 GHz", Boost: "2.52 GHz" },
        Memory: { "Bus Width": "384-bit", Bandwidth: "1008 GB/s" },
        Power: { TDP: "450W", Connectors: "16-pin (4× 8-pin adapter included)" },
        Interface: {
          PCIe: "PCIe 4.0 x16",
          Outputs: "HDMI 2.1, 3× DisplayPort 1.4a",
        },
      },
      images: {
        create: [{ url: "https://picsum.photos/seed/rtx4090/600/600", isPrimary: true, alt: "NVIDIA RTX 4090" }],
      },
      specs: {
        create: [
          { key: "VRAM", value: "24 GB GDDR6X", group: "Memory", sortOrder: 1 },
          { key: "CUDA Cores", value: "16,384", group: "GPU", sortOrder: 2 },
          { key: "Boost Clock", value: "2.52 GHz", group: "Clocks", sortOrder: 3 },
          { key: "TDP", value: "450W", group: "Power", sortOrder: 4 },
          { key: "Interface", value: "PCIe 4.0 x16", group: "Interface", sortOrder: 5 },
        ],
      },
    },
  })

  const cpu1 = await prisma.product.upsert({
    where: { slug: "amd-ryzen-9-7950x" },
    update: {},
    create: {
      name: "AMD Ryzen 9 7950X",
      slug: "amd-ryzen-9-7950x",
      description:
        "AMD's flagship desktop processor with 16 cores and 32 threads for ultimate workstation performance.",
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
        "Core Configuration": { Cores: 16, Threads: 32, Architecture: "Zen 4" },
        Clocks: { Base: "4.5 GHz", Boost: "5.7 GHz" },
        Cache: { L2: "16 MB", L3: "64 MB" },
        Platform: { Socket: "AM5", TDP: "170W", Process: "TSMC 5nm" },
        Memory: { Support: "DDR5-5200", "Max RAM": "128 GB", Channels: "Dual" },
      },
      images: {
        create: [{ url: "https://picsum.photos/seed/ryzen9/600/600", isPrimary: true, alt: "AMD Ryzen 9 7950X" }],
      },
      specs: {
        create: [
          { key: "Cores/Threads", value: "16 / 32", group: "Core Config", sortOrder: 1 },
          { key: "Base Clock", value: "4.5 GHz", group: "Clocks", sortOrder: 2 },
          { key: "Boost Clock", value: "5.7 GHz", group: "Clocks", sortOrder: 3 },
          { key: "TDP", value: "170W", group: "Power", sortOrder: 4 },
          { key: "Socket", value: "AM5", group: "Platform", sortOrder: 5 },
          { key: "Cache", value: "64 MB L3", group: "Cache", sortOrder: 6 },
        ],
      },
    },
  })

  const ssd1 = await prisma.product.upsert({
    where: { slug: "samsung-990-pro-2tb" },
    update: {},
    create: {
      name: "Samsung 990 Pro 2TB NVMe",
      slug: "samsung-990-pro-2tb",
      description: "Blazing-fast PCIe 4.0 NVMe SSD with sequential read speeds up to 7,450 MB/s.",
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
        Capacity: { Size: "2 TB", Formatted: "~1.86 TB" },
        Performance: {
          "Sequential Read": "7,450 MB/s",
          "Sequential Write": "6,900 MB/s",
          "Random Read": "1,600K IOPS",
          "Random Write": "1,550K IOPS",
        },
        Hardware: {
          Interface: "PCIe 4.0 x4 NVMe",
          "Form Factor": "M.2 2280",
          NAND: "Samsung V-NAND TLC",
          Controller: "Samsung Elpis 2",
        },
        Reliability: { MTBF: "1.5 Million Hours", TBW: "1,200 TB", Warranty: "5 Years" },
      },
      images: {
        create: [{ url: "https://picsum.photos/seed/samsung990/600/600", isPrimary: true, alt: "Samsung 990 Pro 2TB" }],
      },
      specs: {
        create: [
          { key: "Capacity", value: "2 TB", group: "Capacity", sortOrder: 1 },
          { key: "Interface", value: "PCIe 4.0 x4", group: "Hardware", sortOrder: 2 },
          { key: "Read Speed", value: "7,450 MB/s", group: "Performance", sortOrder: 3 },
          { key: "Write Speed", value: "6,900 MB/s", group: "Performance", sortOrder: 4 },
          { key: "Form Factor", value: "M.2 2280", group: "Hardware", sortOrder: 5 },
        ],
      },
    },
  })

  // Peripherals
  const mouse1 = await prisma.product.upsert({
    where: { slug: "logitech-g-pro-x-superlight-2" },
    update: {},
    create: {
      name: "Logitech G Pro X Superlight 2",
      slug: "logitech-g-pro-x-superlight-2",
      description: "Ultra-lightweight wireless gaming mouse used by esports professionals worldwide.",
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
        Sensor: {
          Model: "HERO 2 25K",
          "DPI Range": "100 – 25,600",
          "Tracking Speed": "500 IPS",
          Acceleration: "40G",
        },
        Design: {
          Weight: "60g (without cable)",
          Dimensions: "125.9 × 63.5 × 40.0 mm",
          Feet: "100% PTFE",
        },
        Wireless: {
          Technology: "LIGHTSPEED 2.4 GHz",
          "Battery Life": "Up to 95 hours",
          Charge: "USB-C",
        },
        Buttons: { Count: 5, Switches: "Mechanical, rated 90M clicks" },
      },
      images: {
        create: [
          { url: "https://picsum.photos/seed/logimouse/600/600", isPrimary: true, alt: "Logitech G Pro X Superlight 2" },
        ],
      },
      specs: {
        create: [
          { key: "Sensor", value: "HERO 2 25K", group: "Sensor", sortOrder: 1 },
          { key: "Weight", value: "60g", group: "Design", sortOrder: 2 },
          { key: "Battery Life", value: "Up to 95 hours", group: "Wireless", sortOrder: 3 },
          { key: "DPI Range", value: "100 – 25,600", group: "Sensor", sortOrder: 4 },
          { key: "Connectivity", value: "LIGHTSPEED Wireless", group: "Wireless", sortOrder: 5 },
        ],
      },
    },
  })

  await prisma.product.upsert({
    where: { slug: "keychron-q1-pro" },
    update: {},
    create: {
      name: "Keychron Q1 Pro Wireless Keyboard",
      slug: "keychron-q1-pro",
      description: "Premium 75% wireless mechanical keyboard with gasket mount and hot-swappable switches.",
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
        Layout: { Size: "75%", Keys: 82, "Hot-Swap": true },
        Switch: {
          Default: "Keychron K Pro Red",
          "Actuation Force": "45g",
          "Travel Distance": "4.0 mm",
        },
        Connectivity: {
          Wireless: "Bluetooth 5.1",
          Wired: "USB-C",
          "Multi-device": "3 devices",
        },
        Battery: { Capacity: "4,000 mAh", Life: "Up to 300 hours (backlight off)" },
        Build: {
          Case: "Anodized Aluminum",
          Mount: "Gasket Mount",
          RGB: "South-facing per-key RGB",
        },
      },
      images: {
        create: [{ url: "https://picsum.photos/seed/keychron/600/600", isPrimary: true, alt: "Keychron Q1 Pro" }],
      },
      specs: {
        create: [
          { key: "Layout", value: "75%", group: "Layout", sortOrder: 1 },
          { key: "Switch", value: "Keychron K Pro Red (hot-swap)", group: "Switch", sortOrder: 2 },
          { key: "Connectivity", value: "Bluetooth 5.1 / USB-C", group: "Connectivity", sortOrder: 3 },
          { key: "Battery", value: "4,000 mAh", group: "Battery", sortOrder: 4 },
          { key: "Build", value: "Aluminum + Gasket Mount", group: "Build", sortOrder: 5 },
        ],
      },
    },
  })

  const monitor1 = await prisma.product.upsert({
    where: { slug: "lg-ultragear-27gp950" },
    update: {},
    create: {
      name: "LG UltraGear 27GP950 4K 144Hz",
      slug: "lg-ultragear-27gp950",
      description:
        "4K gaming monitor with Nano IPS display, 144Hz refresh rate, and HDMI 2.1 for next-gen gaming.",
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
        Panel: { Type: "Nano IPS", Size: '27"', Curvature: "Flat", Coating: "Anti-glare" },
        Resolution: { Native: "3840 × 2160 (4K UHD)", "Aspect Ratio": "16:9" },
        Performance: {
          "Refresh Rate": "144 Hz",
          "Response Time": "1ms GtG",
          HDR: "VESA DisplayHDR 600",
          VRR: "G-Sync Compatible, FreeSync Premium Pro",
        },
        Ports: {
          HDMI: "HDMI 2.1 × 2",
          DisplayPort: "DP 1.4 × 1",
          "USB-A": "USB 3.0 × 2 (hub)",
        },
        Ergonomics: {
          Tilt: "-5° to 15°",
          "Height Adjust": "110 mm",
          Swivel: "-20° to 20°",
          VESA: "100 × 100 mm",
        },
      },
      images: {
        create: [
          { url: "https://picsum.photos/seed/lgmonitor/600/600", isPrimary: true, alt: "LG UltraGear 27GP950" },
        ],
      },
      specs: {
        create: [
          { key: "Panel", value: "Nano IPS", group: "Panel", sortOrder: 1 },
          { key: "Resolution", value: "3840 × 2160 (4K)", group: "Resolution", sortOrder: 2 },
          { key: "Refresh Rate", value: "144 Hz", group: "Performance", sortOrder: 3 },
          { key: "Response Time", value: "1ms GtG", group: "Performance", sortOrder: 4 },
          { key: "HDR", value: "HDR600", group: "Performance", sortOrder: 5 },
          { key: "Ports", value: "HDMI 2.1 × 2, DP 1.4, USB-A × 2", group: "Ports", sortOrder: 6 },
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
    update: {},
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
            url: "https://picsum.photos/seed/test-payment/800/600",
            alt: "RTW-RTP Test Payment Product",
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

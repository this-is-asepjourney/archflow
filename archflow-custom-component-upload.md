# ArchFlow — Konsep Tambahan: Custom Component Upload & Dynamic Properties Panel

> Melengkapi Blueprint §5 (Topology Builder) dan §15 (Template Marketplace). Fitur ini menjawab kondisi: **komponen/tools yang dibutuhkan user tidak ada di daftar bawaan (default components)**, sehingga user perlu bisa menambahkan sendiri — lengkap dengan skema properties-nya, supaya panel properties otomatis menyesuaikan (termasuk field yang berupa dropdown).

---

## 1. Latar Belakang / Masalah

Sidebar **Components** di canvas (Flowchart, Network, IoT/Embedded, Observability, Endpoints, dst) berisi daftar node bawaan yang fixed — di-hardcode dari sisi aplikasi. Masalahnya:

- Tiap user/industri punya tools & perangkat yang berbeda-beda (merk router tertentu, sensor IoT custom, software infrastruktur internal perusahaan, dsb) yang tidak mungkin semua di-cover sebagai komponen bawaan.
- Kalau user butuh komponen yang tidak ada, saat ini tidak ada jalan lain selain memakai node generik tanpa properties yang relevan.

**Solusi:** user bisa **upload komponen/tools sendiri** — bukan cuma icon & nama, tapi juga *skema properties*-nya (field apa saja yang relevan untuk komponen itu). Setelah diupload, komponen ini otomatis muncul di sidebar Components dan bisa dipakai di canvas seperti komponen bawaan — termasuk panel Properties yang ikut menyesuaikan otomatis, termasuk field bertipe **dropdown** dengan opsi yang sudah ditentukan saat upload.

---

## 2. Study Case

**Skenario:** Asep sedang membuat project topologi jaringan untuk sebuah pabrik. Ia butuh menambahkan node untuk *timbangan scrap digital* (custom IoT device) dan *PLC industrial* — dua-duanya tidak ada di daftar komponen bawaan ArchFlow (yang isinya generik: Router, Switch, ESP32, Arduino, dst).

**Alur yang diinginkan:**

1. Asep membuka **Component Library** → klik **"+ Upload Component"**.
2. Ia isi form:
   - Nama: `Timbangan Scrap Digital`
   - Kategori: `IoT / Embedded`
   - Icon: upload PNG/SVG timbangan
   - Deskripsi: `Timbangan digital dengan output serial RS232, dipakai untuk pencatatan berat scrap otomatis`
3. Ia mendefinisikan **skema properties** — field apa saja yang relevan untuk node ini, termasuk yang berupa dropdown pilihan:
   - `merk_timbangan` → tipe **dropdown**, opsi: `CAS`, `Excellent`, `Digi`, `Lainnya`
   - `koneksi` → tipe **dropdown**, opsi: `RS232`, `RS485`, `USB`, `Bluetooth`
   - `kapasitas_maksimal` → tipe **number** (dengan satuan `kg`)
   - `protokol_data` → tipe **dropdown**, opsi: `Raw Serial`, `Modbus RTU`, `Custom Frame`
4. Klik **Publish** (visibility: `Workspace`, biar bisa dipakai lintas project miliknya).
5. Komponen `Timbangan Scrap Digital` sekarang **muncul di sidebar Components**, di kategori IoT/Embedded, sejajar dengan ESP32/Arduino/Raspberry Pi bawaan.
6. Asep drag komponen itu ke canvas → panel **Properties** di kanan otomatis menampilkan field-field yang tadi ia definisikan: `merk_timbangan` dan `koneksi` tampil sebagai **dropdown select** (bukan free text), `kapasitas_maksimal` sebagai input number, dst.
7. Asep pilih dari dropdown: merk = `CAS`, koneksi = `RS232` — data ini tersimpan di node sebagai bagian dari project, siap dipakai lagi di project lain atau untuk generate dokumentasi otomatis.

Dengan alur ini, **komponen apapun yang dibutuhkan user** — baik untuk kategori Network, IoT, maupun Infrastructure — bisa ditambahkan tanpa perlu app di-update oleh developer ArchFlow, dan properties-nya tetap terstruktur (bukan sekadar free text semua), karena dropdown-nya sudah didefinisikan sejak awal.

---

## 3. Struktur Halaman

```
Component Library
├── Tab: My Components      → private, hanya milik user
├── Tab: Workspace          → shared ke anggota workspace/tim
└── Tab: Marketplace        → public, submit untuk direview
```

Tiap komponen yang sudah diupload muncul sebagai card (icon + nama + kategori), dengan tombol **Edit** dan **Delete**, serta indikator status: `Draft`, `Published`, `Pending Review` (khusus Marketplace).

### Form Upload — 3 Step

**Step 1 — Info Dasar**

| Field | Tipe | Keterangan |
|---|---|---|
| Nama komponen | text | mis. `Timbangan Scrap Digital` |
| Kategori | dropdown | `Network`, `IoT/Embedded`, `Infrastructure/Compute`, `Cloud`, `Data`, `Observability`, `Endpoint`, `Aplikasi` |
| Icon | file upload (SVG/PNG) | disimpan ke object storage (MinIO) |
| Deskripsi | textarea | opsional |
| Vendor/Brand | text | opsional |

**Step 2 — Properties Schema Builder**

User mendefinisikan daftar field yang akan muncul di panel Properties saat komponen ini dipakai. Untuk tiap field, user menentukan **tipe field**:

| Tipe Field | Kapan dipakai | Tampilan di Properties Panel |
|---|---|---|
| `text` | nilai bebas, mis. hostname | input teks biasa |
| `number` | nilai angka, mis. kapasitas, port | input angka (bisa + satuan) |
| `boolean` | true/false, mis. "PoE Support?" | toggle switch |
| `dropdown` (select) | nilai harus dari daftar tertentu | `<select>` dropdown |
| `multi_select` | bisa pilih lebih dari satu opsi | checkbox list / multi-select |
| `textarea` | catatan panjang | textarea |

Khusus tipe **dropdown** dan **multi_select**, user wajib mengisi daftar opsinya saat upload:

```
+ Add Field
┌───────────────────────────────────────────────┐
│ Field key:   [ koneksi                    ]     │
│ Label:       [ Jenis Koneksi              ]     │
│ Type:        [ dropdown ▾ ]                     │
│ Options:     [ RS232 ] [ RS485 ] [ USB ] [ + ]  │
│ Default:     [ RS232 ▾ ]                        │
│ Required:    [ ✓ ]                              │
└───────────────────────────────────────────────┘
```

**Step 3 — Preview & Publish**

- Preview card komponen seperti yang akan tampil di sidebar.
- Preview panel Properties — render langsung dari schema Step 2, termasuk dropdown-nya, supaya user bisa cek tampilannya sebelum publish.
- Pilih visibility: `Private` / `Workspace` / `Submit to Marketplace`.

---

## 4. Format Skema Properties (disimpan sebagai JSON)

Ini yang menentukan bagaimana panel Properties dirender secara dynamic — termasuk field mana yang jadi dropdown dan apa saja opsinya.

```json
{
  "component_type_key": "timbangan-scrap-digital",
  "category": "iot",
  "fields": [
    {
      "key": "merk_timbangan",
      "label": "Merk Timbangan",
      "type": "dropdown",
      "options": ["CAS", "Excellent", "Digi", "Lainnya"],
      "default": "CAS",
      "required": true
    },
    {
      "key": "koneksi",
      "label": "Jenis Koneksi",
      "type": "dropdown",
      "options": ["RS232", "RS485", "USB", "Bluetooth"],
      "default": "RS232",
      "required": true
    },
    {
      "key": "kapasitas_maksimal",
      "label": "Kapasitas Maksimal",
      "type": "number",
      "unit": "kg",
      "default": 1000
    },
    {
      "key": "protokol_data",
      "label": "Protokol Data",
      "type": "dropdown",
      "options": ["Raw Serial", "Modbus RTU", "Custom Frame"],
      "default": "Raw Serial",
      "required": false
    }
  ]
}
```

Field `options` inilah yang bikin panel Properties menampilkan **dropdown berisi data yang sudah tercantum** saat upload — bukan free text lagi, sesuai kebutuhan yang diminta.

---

## 5. Data Model (Prisma) — nambah ke skema Node/Edge sebelumnya

```prisma
model ComponentDefinition {
  id               String   @id @default(uuid())
  workspaceId      String?  // null kalau visibility = public
  createdById      String
  name             String
  category         String   // "network", "iot", "infrastructure", dst
  typeKey          String   @unique // slug unik, dipakai sebagai `type` di Node
  iconUrl          String
  description      String?
  vendor           String?
  propertiesSchema Json     // format sesuai bagian 4 di atas
  visibility       String   @default("private") // private | workspace | public
  status           String   @default("draft")   // draft | published | pending_review
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Node {
  id            String   @id @default(uuid())
  diagramId     String
  type          String   // typeKey — bisa dari komponen bawaan ATAU dari ComponentDefinition custom
  category      String
  label         String
  properties    Json     // hasil isian user berdasarkan propertiesSchema
  // ...field lain seperti sebelumnya (position, status, environment, dst)
  diagram       Diagram  @relation(fields: [diagramId], references: [id])
}
```

**Cara kerja saat node dipasang di canvas:**
1. Sistem cek `type` node → cari ke komponen bawaan (hardcoded) dulu, kalau tidak ketemu → cari ke `ComponentDefinition` (custom).
2. Ambil `propertiesSchema` dari sumber yang ketemu.
3. Panel Properties di-generate otomatis dari schema itu — field `type: dropdown` dirender sebagai `<select>` dengan isi dari `options`, field `type: text` dirender sebagai input teks, dst.
4. Nilai yang diisi user (mis. `merk_timbangan: "CAS"`) disimpan di `Node.properties` (bukan di `ComponentDefinition` — karena itu template, ini instance-nya).

---

## 6. Alur Data End-to-End (ringkas)

```
[User isi form upload]
        │
        ▼
[Simpan ke ComponentDefinition]
   - iconUrl → MinIO
   - propertiesSchema → JSON (lihat bagian 4)
        │
        ▼
[Komponen muncul di Sidebar Components]
   - dikelompokkan sesuai `category`
   - sejajar dengan komponen bawaan
        │
        ▼
[User drag komponen ke Canvas]
        │
        ▼
[Node baru dibuat, type = typeKey]
        │
        ▼
[Panel Properties render dynamic form]
   - baca propertiesSchema dari ComponentDefinition
   - field dropdown → <select options=...>
   - field number → input + satuan
   - dst
        │
        ▼
[User isi nilai → tersimpan di Node.properties]
```

---

## 7. Hal yang Perlu Diperhatikan

- **Validasi `typeKey` unik**: harus dicek supaya tidak bentrok dengan komponen bawaan atau komponen lain di workspace/marketplace yang sama.
- **Reusable antar project**: komponen dengan visibility `Workspace` sebaiknya bisa dipakai di semua project dalam satu workspace, tidak perlu upload ulang tiap project baru — jadi kalau Asep sudah upload "Timbangan Scrap Digital" sekali, di project berikutnya tinggal drag dari sidebar.
- **Versioning schema**: kalau user edit `propertiesSchema` (misal nambah opsi dropdown baru) setelah komponen ini sudah dipakai di banyak node/project — node lama tetap simpan nilai yang sudah diisi, hanya opsi dropdown baru yang nambah untuk pemakaian ke depan (bukan menghapus nilai lama yang sudah tidak ada di opsi terbaru).
- **Fallback tipe field**: kalau `type` field tidak dikenali sistem (misal typo saat bikin schema), sebaiknya fallback render sebagai `text` biasa, bukan bikin panel error.
- **Marketplace review**: komponen dengan visibility `public` masuk status `pending_review` dulu, konsisten dengan mekanisme Template Marketplace di Blueprint §15.

---

*Dokumen ini melengkapi rancangan properties schema sebelumnya (`archflow-topology-node-properties.md`) — bedanya, dokumen itu untuk komponen bawaan yang sudah pasti ada di sistem, sedangkan dokumen ini untuk komponen custom yang didefinisikan sendiri oleh user lewat fitur upload.*

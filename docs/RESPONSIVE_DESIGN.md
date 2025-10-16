# Responsive Design Implementation

## 📱 Overview
L'applicazione Ghost Writing è stata completamente ottimizzata per tutti i dispositivi, da smartphone a desktop.

## 🎯 Breakpoints Utilizzati

```css
/* Mobile: < 640px */
/* Tablet: 640px - 1023px (sm, md) */
/* Desktop: 1024px+ (lg, xl) */
```

## 🔧 Componenti Responsive

### 1. **Sidebar**
- **Desktop (lg+)**: Sidebar fissa con collasso
- **Mobile (<lg)**: Sidebar nascosta di default
  - Accessibile tramite menu hamburger
  - Overlay scuro quando aperta
  - Chiusura automatica su resize

```tsx
<Sidebar
  collapsed={sidebarCollapsed}
  onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
  mobileOpen={mobileMenuOpen}
  onMobileClose={() => setMobileMenuOpen(false)}
/>
```

### 2. **PageContainer**
- Padding responsive: `p-4 sm:p-6`
- Menu hamburger integrato per mobile
- Titoli scalabili: `text-xl sm:text-2xl`

```tsx
<PageContainer
  title="Dashboard"
  description="Panoramica generale"
  onMenuClick={() => setMobileMenuOpen(true)}
>
```

### 3. **Dashboard Cards**
- Grid responsive: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Gap adattivo: `gap-4 sm:gap-6`
- Font size scalabile per numeri e testo

### 4. **ProjectTableV2**
- **Desktop**: Tabella completa con sorting
- **Mobile**: Card view con informazioni essenziali
  - Informazioni compatte e leggibili
  - Pulsanti azione inline
  - Scroll orizzontale per filtri

```tsx
{/* Desktop Table View */}
<div className="hidden md:block">
  <table>...</table>
</div>

{/* Mobile Card View */}
<div className="md:hidden">
  {projects.map(project => (
    <div className="card">...</div>
  ))}
</div>
```

### 5. **Modal**
- Padding responsive: `p-2 sm:p-4`
- Altezza massima: `max-h-[95vh]`
- Titoli troncati su mobile
- Content scrollabile

### 6. **Forms (NewProjectModal)**
- Grid adattivo: `grid-cols-1 sm:grid-cols-2`
- Label più piccole su mobile: `text-xs sm:text-sm`
- Input con font size appropriato

## 📐 Pattern Comuni

### Grid Layouts
```tsx
// 1 colonna mobile, 2 tablet, 4 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

### Spacing
```tsx
// Padding responsive
className="p-4 sm:p-6"

// Gap responsive
className="gap-3 sm:gap-4 lg:gap-6"

// Margin responsive
className="mb-4 sm:mb-6"
```

### Typography
```tsx
// Titoli
className="text-lg sm:text-xl md:text-2xl"

// Testo normale
className="text-sm sm:text-base"

// Testo piccolo
className="text-xs sm:text-sm"
```

### Visibilità Condizionale
```tsx
// Nascondi su mobile
className="hidden sm:block"

// Mostra solo su mobile
className="sm:hidden"

// Nascondi sotto tablet
className="hidden md:block"
```

## 🎨 Esempi di Utilizzo

### Stats Cards Responsive
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {stats.map((stat) => (
    <Card key={stat.label} padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{stat.label}</p>
          <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
        </div>
        <stat.icon size={24} />
      </div>
    </Card>
  ))}
</div>
```

### Tabs Responsive con Scroll
```tsx
<div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
  {tabs.map((tab) => (
    <button className="flex items-center gap-2 px-3 sm:px-4 py-2 whitespace-nowrap">
      <Icon size={18} />
      <span className="hidden sm:inline">{tab.label}</span>
    </button>
  ))}
</div>
```

### Activity List Responsive
```tsx
<div className="space-y-3">
  {activities.map((activity) => (
    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg">
      <div className="w-2 h-2 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium break-words">
          {activity.description}
        </p>
        <p className="text-xs text-gray-600 break-words">
          {activity.details}
        </p>
      </div>
    </div>
  ))}
</div>
```

## 🔍 Testing

### Dispositivi da Testare
- **Mobile**: 375px (iPhone SE), 390px (iPhone 12/13/14)
- **Tablet**: 768px (iPad), 820px (iPad Air)
- **Desktop**: 1024px, 1280px, 1920px

### Chrome DevTools
1. Apri DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Testa vari dispositivi dal dropdown
4. Verifica orientamento portrait/landscape

### Test Checklist
- [ ] Menu hamburger appare su mobile
- [ ] Sidebar si nasconde automaticamente
- [ ] Tabelle diventano card su mobile
- [ ] Forms sono scrollabili e compilabili
- [ ] Modali non fuoriescono dallo schermo
- [ ] Testo è leggibile senza zoom
- [ ] Pulsanti sono facilmente cliccabili (min 44x44px)
- [ ] Nessun overflow orizzontale indesiderato

## 🚀 Performance

### Ottimizzazioni Implementate
- CSS-in-JS evitato in favore di Tailwind
- Hidden elements usano `display: none` per non renderizzare
- Sidebar mantiene stato tra navigazioni
- Lazy loading per tab content

## 📝 Best Practices

1. **Mobile First**: Progetta prima per mobile, poi espandi
2. **Touch Targets**: Minimo 44x44px per elementi interattivi
3. **Leggibilità**: Font minimo 14px per body text su mobile
4. **Spazi**: Padding generoso per facilitare touch
5. **Overflow**: Gestire scroll con `overflow-x-auto` quando necessario
6. **Truncate**: Usare `truncate` per testi lunghi in spazi limitati

## 🐛 Problemi Comuni e Soluzioni

### Problema: Menu non si chiude
**Soluzione**: Verificare che `onMobileClose` sia passato correttamente

### Problema: Sidebar copre contenuto
**Soluzione**: Usare `z-index` appropriati (sidebar: 50, overlay: 40)

### Problema: Testo troppo piccolo
**Soluzione**: Usare classi responsive: `text-sm sm:text-base`

### Problema: Form non scrollabile
**Soluzione**: Modal usa `max-h-[95vh]` e `overflow-y-auto`

## 🎯 Future Improvements

- [ ] Gesture swipe per aprire/chiudere sidebar
- [ ] Pull-to-refresh per liste
- [ ] Infinite scroll per tabelle lunghe
- [ ] PWA support per installazione mobile
- [ ] Orientamento landscape ottimizzato

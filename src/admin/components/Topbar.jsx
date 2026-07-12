import {
  ArrowUpRight,
  Bell,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Settings,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react';
import globalSettings from '../../common/utils/globalSettings';

const navIcons = {
  dashboard: LayoutDashboard,
  reviewShowcase: Star,
  reviewForm: FileText,
  emailTemplates: Mail,
  settings: Settings,
  supportForum: LifeBuoy,
};

function Topbar() {
  const currentUrl = window.location.href;
  const { menuitems, proLink, version } = globalSettings.topbar;
  const assetPath = tsreview_settings.assets_path;

  const isActiveItem = (link) => {
    if (!link.startsWith('?page=ts-review-showcase')) {
      return false;
    }

    const marker = link.replace('?page=ts-review-showcase', '');
    return currentUrl.includes(marker);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <a href="?page=ts-review-showcase&path=dashboard" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105">
            <img src={`${assetPath}/img/tsreview_icon_white.svg`} className="h-[18px] w-[18px]" alt="TS Customer Review" />
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-primary-glow ring-2 ring-background" />
          </span>

          <span className="hidden text-[15px] font-bold tracking-tight text-foreground sm:block">
            TS Customer Review
          </span>
        </a>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {Object.entries(menuitems).map(([key, item]) => {
            const Icon = navIcons[key] || LayoutDashboard;
            const isActive = isActiveItem(item.link);
            const isExternal = item.link.startsWith('http') || item.link.startsWith('admin.php');

            return (
              <a
                key={key}
                href={item.link}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
                className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {isActive ? <span className="absolute inset-x-3 -bottom-[17px] h-0.5 rounded-full gradient-primary" /> : null}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {proLink?.link ? (
            <a
              href={proLink.link}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 sm:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {proLink.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : null}

          <span className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            v {version}
          </span>

          <a
            href="https://wordpress.org/support/plugin/ts-review-showcase"
            target="_blank"
            rel="noreferrer"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <CircleHelp className="h-4 w-4" />
          </a>

          <button type="button" className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary-glow" />
          </button>

          <a
            href="admin.php?page=tsreview-pro-account"
            className="grid h-9 w-9 place-items-center rounded-full gradient-primary text-white shadow-[var(--shadow-glow)]"
          >
            <UserRound className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="border-t border-border/70 md:hidden">
        <div className="mx-auto flex w-full max-w-[1400px] gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {Object.entries(menuitems).map(([key, item]) => {
            const Icon = navIcons[key] || LayoutDashboard;
            const isActive = isActiveItem(item.link);
            const isExternal = item.link.startsWith('http') || item.link.startsWith('admin.php');

            return (
              <a
                key={key}
                href={item.link}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export default Topbar;

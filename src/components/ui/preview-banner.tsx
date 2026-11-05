interface PreviewBannerProps {
  children: string;
}

export function PreviewBanner({ children }: PreviewBannerProps) {
  return (
    <p className="border-b border-line bg-card px-4 py-3 text-sm leading-6 text-muted">
      {children}
    </p>
  );
}

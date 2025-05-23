type MessageBoxProps = {
  type: 'error' | 'success';
  children: React.ReactNode;
};

export function MessageBox({ type, children }: MessageBoxProps) {
  const baseClass = "p-3 rounded-md text-sm";
  const classes = type === 'error'
    ? `${baseClass} bg-red-100 text-red-800`
    : `${baseClass} bg-green-100 text-green-800`;

  return <div className={classes}>{children}</div>;
}

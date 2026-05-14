interface StatusBadgeProps {
  status: 'pending' | 'shortlisted' | 'offered' | 'rejected';
}

const statusConfig = {
  pending: {
    bg: 'rgba(142,142,147,0.12)',
    text: '#6E6E73',
    icon: '●',
  },
  shortlisted: {
    bg: 'rgba(255,159,10,0.12)',
    text: '#B36B00',
    icon: '◆',
  },
  offered: {
    bg: 'rgba(52,199,89,0.12)',
    text: '#1A7A32',
    icon: '✓',
  },
  rejected: {
    bg: 'rgba(255,59,48,0.12)',
    text: '#C0362D',
    icon: '✕',
  }
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span 
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium tracking-[0.2px] capitalize"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <span className="text-[10px]">{config.icon}</span>
      {status}
    </span>
  );
}
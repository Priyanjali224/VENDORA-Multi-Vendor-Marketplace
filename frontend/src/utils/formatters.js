/**
 * Formats integer paise into Indian Rupee string (₹).
 * Example: 199900 paise -> "₹1,999"
 */
export const formatPrice = (paise) => {
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0';
  const rupees = Number(paise) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'PLACED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'CONFIRMED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'PACKED':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'SHIPPED':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'DELIVERED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'REFUNDED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'rejected':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'suspended':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

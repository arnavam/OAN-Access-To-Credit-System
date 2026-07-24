export const generateMockApplications = (count: number = 319) => {
  const products = ['CBE Smallholder Seed Loan', 'CBE Agri Input Finance', 'CBE Pastoralist Livestock Loan', 'CBE Farm Equipment Loan'];
  const statuses = [
    { status: 'In Review', statusColor: 'bg-blue-50 text-blue-600 border border-blue-200', dotColor: 'bg-blue-600' },
    { status: 'Pending', statusColor: 'bg-orange-50 text-orange-600 border border-orange-200', dotColor: 'bg-orange-600' },
    { status: 'In Underwriting', statusColor: 'bg-purple-50 text-purple-600 border border-purple-200', dotColor: 'bg-purple-600' },
    { status: 'Approved', statusColor: 'bg-green-50 text-green-600 border border-green-300', dotColor: 'bg-green-600' },
    { status: 'Rejected', statusColor: 'bg-red-50 text-red-600 border border-red-200', dotColor: 'bg-red-600' }
  ];

  const colors = [
    'bg-green-100 text-green-700',
    'bg-blue-100 text-blue-700',
    'bg-orange-100 text-orange-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700'
  ];

  // Specific rows to match the mock exactly
  const mockRows = [
    {
      id: '0', initials: 'AG', name: 'Abebe Girma', farmerId: 'ET-FRM-2026-00872', color: colors[0],
      product: 'CBE Smallholder Seed Loan', amount: 'ETB 1,50,000', date: 'Jul 12, 2026, 10:42 AM',
      ...statuses[0]
    },
    {
      id: '1', initials: 'DB', name: 'Dereje Bekele', farmerId: 'ET-FRM-2026-00988', color: colors[1],
      product: 'CBE Agri Input Finance', amount: 'ETB 32,000', date: 'Jul 11, 2026, 10:42 AM',
      ...statuses[1]
    },
    {
      id: '2', initials: 'MY', name: 'Mohammed Yusuf', farmerId: 'ET-FRM-2026-00631', color: colors[2],
      product: 'CBE Pastoralist Livestock Loan', amount: 'ETB 120,000', date: 'Jul 10, 2026, 10:42 AM',
      ...statuses[2]
    },
    {
      id: '3', initials: 'ST', name: 'Selamawit Tadesse', farmerId: 'ET-FRM-2026-01299', color: colors[3],
      product: 'CBE Smallholder Seed Loan', amount: 'ETB 12,500', date: 'Jul 9, 2026, 10:42 AM',
      ...statuses[3]
    },
    {
      id: '4', initials: 'TH', name: 'Tigist Haile', farmerId: 'ET-FRM-2026-01045', color: colors[4],
      product: 'CBE Agri Input Finance', amount: 'ETB 25,000', date: 'Jul 8, 2026, 10:42 AM',
      ...statuses[3]
    },
    {
      id: '5', initials: 'GA', name: 'Getachew Alemu', farmerId: 'ET-FMR-2026-68714', color: colors[5],
      product: 'CBE Pastoralist Livestock Loan', amount: 'ETB 80,000', date: 'Jul 7, 2026, 10:42 AM',
      ...statuses[4]
    }
  ];

  const applications = [...mockRows];

  const firstNames = ['Abebe', 'Dereje', 'Mohammed', 'Selamawit', 'Tigist', 'Getachew', 'Hana', 'Yohannes', 'Mekdes', 'Dawit'];
  const lastNames = ['Girma', 'Bekele', 'Yusuf', 'Tadesse', 'Haile', 'Alemu', 'Tesfaye', 'Kassahun', 'Worku', 'Assefa'];

  for (let i = mockRows.length; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const initials = `${firstName[0]}${lastName[0]}`;
    const idNum = (1000 + i).toString().padStart(5, '0');
    const id = `ET-FRM-2026-${idNum}`;
    const color = colors[i % colors.length];
    const product = products[Math.floor(Math.random() * products.length)];
    const amountNum = Math.floor(Math.random() * 190) * 1000 + 10000;
    const amount = `ETB ${amountNum.toLocaleString()}`;
    const dateObj = new Date(2026, 6, 6); // Before Jul 7
    dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 30));
    const hours = Math.floor(Math.random() * 8) + 8;
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateStr = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}, ${displayHours}:${minutes} ${ampm}`;
    const statusObj = statuses[Math.floor(Math.random() * statuses.length)];

    applications.push({
      id: i.toString(),
      initials,
      name,
      farmerId: id,
      color,
      product,
      amount,
      date: dateStr,
      ...statusObj
    });
  }

  return applications;
};

export const mockApplications = generateMockApplications(319);

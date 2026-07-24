export const generateMockApplications = (count: number = 55) => {
  const firstNames = ['Abebe', 'Dereje', 'Mohammed', 'Selamawit', 'Tigist', 'Getachew', 'Hana', 'Yohannes', 'Mekdes', 'Dawit'];
  const lastNames = ['Girma', 'Bekele', 'Yusuf', 'Tadesse', 'Haile', 'Alemu', 'Tesfaye', 'Kassahun', 'Worku', 'Assefa'];
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

  const applications = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const initials = `${firstName[0]}${lastName[0]}`;

    // Generate a somewhat sequential ID
    const idNum = (1000 + i).toString().padStart(5, '0');
    const id = `ET-FRM-2026-${idNum}`;

    const color = colors[i % colors.length];
    const product = products[Math.floor(Math.random() * products.length)];

    // Generate a random amount between 10,000 and 200,000
    const amountNum = Math.floor(Math.random() * 190) * 1000 + 10000;
    const amount = `ETB ${amountNum.toLocaleString()}`;

    // Generate a date within the last 30 days
    const dateObj = new Date(2026, 6, 12); // July 12, 2026 as base
    dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 30));
    const hours = Math.floor(Math.random() * 8) + 8; // 8 AM to 4 PM
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateStr = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}, ${displayHours}:${minutes} ${ampm}`;

    // Force specific distribution for statuses
    let statusObj;
    if (i < 5) statusObj = statuses[0]; // First few In Review
    else if (i >= 5 && i < 15) statusObj = statuses[1]; // Next 10 Pending
    else statusObj = statuses[Math.floor(Math.random() * statuses.length)];

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

  // Ensure sorting by date descending is somewhat realistic, we'll just return as is
  return applications;
};

export const mockApplications = generateMockApplications(55);

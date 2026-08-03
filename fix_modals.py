import os
import re

files = [
    "src/features/(farmer-application)/apply-loan/components/ConsentManagement.tsx",
    "src/features/(bank-admin)/kyc-compliance/components/DeleteDocumentModal.tsx",
    "src/app/(dashboard)/(bank-admin)/dashboard/components/AddLoanProductModal.tsx",
    "src/features/(bank-admin)/kyc-compliance/components/ViewDocumentModal.tsx",
    "src/features/(bank-admin)/product-approvals/components/ApproveProductModal.tsx",
    "src/features/(bank-admin)/product-approvals/components/RejectProductModal.tsx",
    "src/features/(bank-admin)/loan-products/components/AddLoanProductModal.tsx",
    "src/features/(bank-admin)/loan-products/components/EditLoanProductModal.tsx",
    "src/features/(bank-admin)/loan-products/components/DeleteLoanProductModal.tsx",
    "src/app/(portal-account)/login/farmer/components/OtpVerificationPopup.tsx",
    "src/app/(portal-account)/register/components/OrganizationRegisteredPopup.tsx",
    "src/app/(portal-account)/register/components/OtpVerificationPopup.tsx",
]

for file_path in files:
    full_path = os.path.join("/Users/rajujha/Desktop/Project/Access to Credit System/A2C_Project/Next-JS/OAN-Access-To-Credit-System_Second", file_path)
    if not os.path.exists(full_path):
        continue
    
    with open(full_path, "r") as f:
        content = f.read()

    # Revert the one we modified manually
    if "createPortal" in content:
        content = re.sub(r"import \{ createPortal \} from 'react-dom';\n?", "", content)
        content = re.sub(r"const \[mounted, setMounted\] = useState\(false\);\n\s*React.useEffect\(\(\) => setMounted\(true\), \[\]\);\n\n", "", content)
        content = re.sub(r"if \(!isOpen \|\| !mounted\) return null;", "if (!isOpen) return null;", content)
        content = re.sub(r"return createPortal\(", "return (", content)
        content = re.sub(r"    </div>,\n\s*document.body\n\s*\);", "    </div>\n  );", content)
        content = content.replace("z-[100]", "z-50")
        
    # Check if we already added Portal
    if "import { Portal } from '@/components/Portal';" in content:
        continue
        
    # Add import
    content = re.sub(r"('use client';\n)?", r"\1import { Portal } from '@/components/Portal';\n", content, count=1)
    
    # Wrap fixed inset-0
    # Find: return ( \n <div className="fixed inset-0
    pattern = r"(return\s*\(\s*)(<div[^>]*className=[\"'][^\"']*fixed inset-0[^\"']*[\"'][^>]*>)"
    
    def repl(m):
        return m.group(1) + "<Portal>\n      " + m.group(2)
        
    if re.search(pattern, content):
        content = re.sub(pattern, repl, content)
        # Find the last closing tag of the component and add </Portal>
        # This is a bit tricky, let's just find the last `    </div>\n  );`
        content = re.sub(r"( {4}</div>)\n  \);$", r"\1\n    </Portal>\n  );", content, flags=re.MULTILINE)
        
    with open(full_path, "w") as f:
        f.write(content)
    
    print(f"Fixed {file_path}")

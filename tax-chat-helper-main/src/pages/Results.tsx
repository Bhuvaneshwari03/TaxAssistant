
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FontSizeAdjuster } from "@/components/FontSizeAdjuster";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Download, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

  const TAX_FAQ = {
    "save tax": "You can save tax through various deductions under Section 80C like PPF, ELSS, and life insurance premiums. You can also claim HRA if you're paying rent, and home loan interest deductions.",
    "documents": "For tax filing, you'll need: Form 16 from employer, bank interest statements, investment proofs (80C), rent receipts, home loan statement, and PAN card.",
    "tax bracket": "Tax slabs for FY 2023-24 under the old regime are: No tax up to ₹2.5L, 5% up to ₹5L, 20% up to ₹10L, and 30% above ₹10L. A 4% cess is applicable.",
    "hra": "To claim HRA, you need rent receipts, rent agreement, and proof of rent payment. The exemption is the least of: Actual HRA received, 50% of salary (metro) or 40% (non-metro), or rent paid minus 10% of salary.",
    "section 80c": "Under Section 80C, you can invest up to ₹1.5L in PPF, ELSS, NSC, life insurance premiums, or 5-year fixed deposits to save tax.",
    "tax calculation": "To calculate your tax, provide your total income, deductions, and investments. I can help you estimate your tax liability.",
  };
  const calculateTax = (taxableIncome: number) => {
    let tax = 0;
    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 12500 + (taxableIncome - 500000) * 0.2;
    } else {
      tax = 112500 + (taxableIncome - 1000000) * 0.3;
    }
    // Add 4% health and education cess
    return tax + tax * 0.04;
  };
  const suggestInvestments = (income: number) => {
    if (income <= 500000) {
      return "Consider investing in PPF or ELSS to save tax under Section 80C.";
    } else if (income <= 1000000) {
      return "You can save tax by investing in PPF, ELSS, or NPS. Also, consider claiming HRA if applicable.";
    } else {
      return "Maximize your tax savings by investing in PPF, ELSS, NPS, and claiming HRA, home loan interest, and medical insurance premiums.";
    }
  };

const Results = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hi! I'm your tax assistant. Ask me anything about taxes, savings, or documentation requirements!"
  }]);

  if (!state?.totalIncome) {
    navigate("/income");
    return null;
  }

  const handleQuestion = () => {
    if (!question.trim()) return;
  
    const newMessages: Message[] = [...messages, { role: "user", content: question }];
  
    let response = "";
    const lowerCaseQuestion = question.toLowerCase();
  
    // Predefined responses
    const responses: { [key: string]: string } = {
     "hi": "Hello! How can I assist you with your tax-related queries today?",
        "hello": "Hi there! How can I help you with your taxes?",
        "how do I calculate my income tax?": "To calculate your income tax, you need to consider your taxable income, applicable tax slabs, deductions, and exemptions. Would you like assistance with a specific tax year?",
        "what are the tax slabs for this year?": "The tax slabs vary based on the tax regime you choose. Would you like details on the old tax regime or the new one?",
        "how can I reduce my taxable income?": "You can reduce your taxable income through deductions like 80C (Investments), 80D (Health Insurance), HRA, and others. Would you like specific recommendations based on your income?",
        "what is section 80C?": "Section 80C allows deductions up to ₹1.5 lakh on eligible investments like PPF, EPF, NSC, ELSS, and life insurance premiums. Do you need details on any specific investment?",
        "how do I file my income tax return?": "You can file your ITR online through the income tax e-filing portal. Do you need step-by-step guidance?",
        "what is Form 16?": "Form 16 is a TDS certificate issued by your employer that contains details of your salary, deductions, and tax paid. Would you like help understanding it?",
        "what if I missed the ITR filing deadline?": "If you missed the deadline, you can file a belated return before the final due date with a late fee. Do you want to check the penalties applicable?",
        "how can I claim an income tax refund?": "If you have paid excess tax, you can claim a refund while filing your ITR. It usually gets credited to your bank account within a few months. Need help checking your refund status?",
        "what is advance tax?": "Advance tax is the tax paid in installments if your total tax liability exceeds ₹10,000. It is paid quarterly. Would you like to calculate your advance tax?",
        "how do I check my TDS?": "You can check your TDS details in Form 26AS on the income tax portal. Would you like guidance on accessing it?",
        "what is Form 26AS?": "Form 26AS is a consolidated statement of your tax credits, including TDS, advance tax, and self-assessment tax. Do you need help downloading it?",
        "what is capital gains tax?": "Capital gains tax is levied on profits from the sale of assets like stocks, property, and gold. Do you need short-term or long-term capital gains tax details?",
        "how do I save tax on capital gains?": "You can save tax by reinvesting in specified bonds, properties, or availing exemptions under sections like 54, 54F, and 54EC. Would you like detailed guidance?",
        "is crypto taxable in India?": "Yes, gains from crypto trading are taxed at 30% plus 4% cess. Would you like help calculating your crypto tax?",
        "what is GST?": "GST (Goods and Services Tax) is an indirect tax levied on goods and services. Would you like to check GST rates or GST return filing details?",
        "how do I register for GST?": "You can register for GST on the GST portal. Would you like step-by-step assistance?",
        "what is input tax credit (ITC)?": "Input tax credit allows businesses to reduce their GST liability by claiming credit for the tax paid on purchases. Do you want help understanding ITC claims?",
        "how do I file GST returns?": "GST returns are filed on the GST portal. The frequency depends on your business category. Would you like help with GSTR-1, GSTR-3B, or any other return?",
        "what is professional tax?": "Professional tax is a state-imposed tax on salaried employees and professionals. It varies by state. Would you like to check your state's professional tax rates?",
        "how can freelancers save taxes?": "Freelancers can save tax by claiming deductions under 44ADA, business expenses, and investing in 80C options. Need help with specific deductions?",
        "what is section 44ADA?": "Section 44ADA offers presumptive taxation for professionals, allowing them to declare 50% of their income as taxable. Need more details?",
        "how do I pay self-assessment tax?": "You can pay self-assessment tax through the income tax portal using net banking or challan 280. Need assistance?",
        "how do I check my income tax refund status?": "You can check your refund status on the income tax e-filing portal. Need step-by-step guidance?",
        "what is tax audit?": "A tax audit is required if your business turnover exceeds the prescribed limits under section 44AB. Would you like to check if it applies to you?",
        "how do I declare foreign income in ITR?": "Foreign income must be declared in ITR under relevant sections. Avoiding declaration may lead to penalties. Need help understanding DTAA?",
        "what is DTAA?": "Double Taxation Avoidance Agreement (DTAA) prevents double taxation of income earned in two countries. Do you need help claiming tax relief under DTAA?",
        "what is HRA exemption?": "House Rent Allowance (HRA) exemption can be claimed if you live in a rented house and receive HRA as part of your salary. Need help calculating it?",
        "how do I claim home loan tax benefits?": "You can claim deductions under 80C (principal) and 24(b) (interest). Need help calculating your benefits?",
        "how can I file taxes if I have multiple sources of income?": "All income sources must be declared in your ITR. Do you need help categorizing them correctly?",
        "what are the penalties for tax evasion?": "Tax evasion penalties vary but can be severe, including fines and imprisonment. Would you like guidance on tax compliance?",
        "what is presumptive taxation?": "Presumptive taxation allows small businesses and professionals to pay tax on a predefined percentage of income. Would you like to check eligibility?",
        "how do I update my PAN details?": "You can update PAN details on the NSDL portal. Need assistance with the process?",
        "how do I check my PAN-Aadhaar linking status?": "You can check the status on the income tax portal. Need step-by-step guidance?"
    };
    
    // Check if question matches any predefined queries
    response = Object.entries(responses).find(([key]) => lowerCaseQuestion.includes(key))?.[1] || "I'm still learning";
  
    newMessages.push({ role: "assistant", content: response });
    setMessages(newMessages);
    setQuestion("");
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('tax-report.pdf');

      toast({
        title: "Success",
        description: "Your tax report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendEmail = () => {
    // This would typically connect to a backend service
    toast({
      title: "Email Sent",
      description: "Your tax report has been sent to your email.",
    });
  };

  const taxData = [
    {
      name: "Income Breakdown",
      "Total Income": state.totalIncome,
      "Taxable Income": state.taxableIncome,
      "Tax Payable": state.tax,
    },
  ];

  const deductionsData = state.deductions;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="fixed top-4 right-4 flex items-center gap-4">
        <FontSizeAdjuster />
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tax Report Section */}
        <div className="lg:col-span-2 space-y-6">
          <div ref={reportRef}>
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Your Tax Report</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={downloadPDF}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={sendEmail}>
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taxData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="Total Income" fill="#8884d8" />
                    <Bar dataKey="Taxable Income" fill="#82ca9d" />
                    <Bar dataKey="Tax Payable" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deductionsData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    >
                      {deductionsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Total Income</p>
                    <p className="text-xl font-medium">{formatCurrency(state.totalIncome)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Deductions</p>
                    <p className="text-xl font-medium">{formatCurrency(state.totalDeductions)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Taxable Income</p>
                    <p className="text-xl font-medium">{formatCurrency(state.taxableIncome)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tax Payable</p>
                    <p className="text-xl font-medium">{formatCurrency(state.tax)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/income"}
            >
              Back
            </Button>
          </div>
        </div>

        {/* Virtual Assistant Section */}
        <Card className="p-6 h-[calc(100vh-6rem)] flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Tax Assistant</h2>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Ask about taxes, savings, or documents..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleQuestion()}
            />
            <Button size="icon" onClick={handleQuestion}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Results;

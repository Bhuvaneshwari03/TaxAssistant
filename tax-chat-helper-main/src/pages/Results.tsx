
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

  /*const handleQuestion = () => {
    if (!question.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: question }
    ];

    // Simple keyword-based response system
    const response = Object.entries(TAX_FAQ).find(([key]) => 
      question.toLowerCase().includes(key)
    )?.[1] || "I'm sorry, I don't have specific information about that. Please try asking about tax saving, documents needed, or tax brackets.";

    newMessages.push({ role: "assistant", content: response });
    setMessages(newMessages);
    setQuestion("");
  }; */
  const handleQuestion = () => {
    if (!question.trim()) return;
  
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: question }
    ];
  
    let response = "";
  
    // Handle specific queries
    if (question.toLowerCase().includes("tax calculation")) {
      response = "Sure! Please provide your total income and deductions (if any) so I can calculate your tax.";
    } else if (question.toLowerCase().includes("income")) {
      const income = parseFloat(question.replace(/[^0-9.]/g, ""));
      if (!isNaN(income)) {
        const tax = calculateTax(income);
        response = `Based on your income of ${formatCurrency(income)}, your estimated tax liability is ${formatCurrency(tax)}.`;
      } else {
        response = "Please provide a valid income amount.";
      }
    } else {
      // Default FAQ response
      response = Object.entries(TAX_FAQ).find(([key]) =>
        question.toLowerCase().includes(key)
      )?.[1] || "I'm sorry, I don't have specific information about that. Please try asking about tax saving, documents needed, or tax brackets.";
    }
  
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FontSizeAdjuster } from "@/components/FontSizeAdjuster";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const INCOME_SOURCES = [
  "Salaried",
  "Self-Employed",
  "Business",
  "Investments",
  "Others",
];

const CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Other",
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

interface TaxFormData {
  name: string;
  email: string;
  annualIncome: number;
  incomeSource: string;
  hasTaxSavingInvestments: boolean;
  ppfInvestment: number;
  elssInvestment: number;
  npsInvestment: number;
  homeLoanEMI: number;
  rentPaid: number;
  cityOfResidence: string;
  otherIncomeSources: string[];
}

const Income = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TaxFormData>({
    name: "",
    email: "",
    annualIncome: 0,
    incomeSource: "Salaried",
    hasTaxSavingInvestments: false,
    ppfInvestment: 0,
    elssInvestment: 0,
    npsInvestment: 0,
    homeLoanEMI: 0,
    rentPaid: 0,
    cityOfResidence: "Delhi",
    otherIncomeSources: [],
  });

  const calculateTaxableIncome = () => {
    let totalDeductions = 
      (formData.hasTaxSavingInvestments ? 
        formData.ppfInvestment + 
        formData.elssInvestment + 
        formData.npsInvestment : 0) +
      formData.homeLoanEMI +
      formData.rentPaid +
      (formData.incomeSource === "Salaried" ? 50000 : 0);
    
    return Math.max(0, formData.annualIncome - totalDeductions);
  };

  const calculateTax = (taxableIncome: number) => {
    let tax = 0;
    
    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 750000) {
      tax = 12500 + (taxableIncome - 500000) * 0.1;
    } else if (taxableIncome <= 1000000) {
      tax = 37500 + (taxableIncome - 750000) * 0.15;
    } else if (taxableIncome <= 1250000) {
      tax = 75000 + (taxableIncome - 1000000) * 0.2;
    } else if (taxableIncome <= 1500000) {
      tax = 125000 + (taxableIncome - 1250000) * 0.25;
    } else {
      tax = 187500 + (taxableIncome - 1500000) * 0.3;
    }
    
    // Add 4% cess
    tax = tax + (tax * 0.04);
    
    return tax;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taxableIncome = calculateTaxableIncome();
    const tax = calculateTax(taxableIncome);
    
    navigate("/results", {
      state: {
        totalIncome: formData.annualIncome,
        taxableIncome,
        tax,
        totalDeductions: 
          (formData.hasTaxSavingInvestments ? 
            formData.ppfInvestment + 
            formData.elssInvestment + 
            formData.npsInvestment : 0) +
          formData.homeLoanEMI +
          formData.rentPaid +
          (formData.incomeSource === "Salaried" ? 50000 : 0),
        deductions: [
          { name: "80C", value: formData.ppfInvestment + formData.elssInvestment + formData.npsInvestment },
          { name: "HRA", value: formData.rentPaid },
          { name: "Home Loan", value: formData.homeLoanEMI },
          ...(formData.incomeSource === "Salaried" ? [{ name: "Standard", value: 50000 }] : []),
        ].filter(d => d.value > 0)
      }
    });
  };

  const taxableIncome = calculateTaxableIncome();
  const tax = calculateTax(taxableIncome);

  const chartData = [
    {
      name: "Income Breakdown",
      "Total Income": formData.annualIncome,
      "Taxable Income": taxableIncome,
      "Tax Payable": tax,
    },
  ];

  const investmentData = [
    { name: "PPF", value: formData.ppfInvestment },
    { name: "ELSS", value: formData.elssInvestment },
    { name: "NPS", value: formData.npsInvestment },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="fixed top-4 right-4 flex items-center gap-4">
        <FontSizeAdjuster />
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Basic Information</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income">Annual Income (₹)</Label>
                  <Input
                    id="income"
                    type="number"
                    required
                    value={formData.annualIncome || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        annualIncome: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Income Source</Label>
                  <Select
                    value={formData.incomeSource}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, incomeSource: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select income source" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tax Saving Investments */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Tax Saving Investments</h2>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tax-savings"
                    checked={formData.hasTaxSavingInvestments}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasTaxSavingInvestments: checked,
                      }))
                    }
                  />
                  <Label htmlFor="tax-savings">I have tax saving investments</Label>
                </div>

                {formData.hasTaxSavingInvestments && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>PPF Investment (₹)</Label>
                      <Input
                        type="number"
                        value={formData.ppfInvestment || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ppfInvestment: Number(e.target.value),
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ELSS Investment (₹)</Label>
                      <Input
                        type="number"
                        value={formData.elssInvestment || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            elssInvestment: Number(e.target.value),
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>NPS Investment (₹)</Label>
                      <Input
                        type="number"
                        value={formData.npsInvestment || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            npsInvestment: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Additional Details</h2>
                
                <div className="space-y-2">
                  <Label>Home Loan EMI (₹)</Label>
                  <Input
                    type="number"
                    value={formData.homeLoanEMI || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        homeLoanEMI: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rent Paid (₹)</Label>
                  <Input
                    type="number"
                    value={formData.rentPaid || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rentPaid: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>City of Residence</Label>
                  <Select
                    value={formData.cityOfResidence}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        cityOfResidence: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Charts and Visualizations */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-2xl font-semibold">Tax Summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="Total Income" fill="#8884d8" />
                        <Bar dataKey="Taxable Income" fill="#82ca9d" />
                        <Bar dataKey="Tax Payable" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {investmentData.length > 0 && (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={investmentData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(entry) => entry.name}
                          >
                            {investmentData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => window.location.href = "/"}>
                Back
              </Button>
              <Button type="submit">Calculate Tax</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Income;

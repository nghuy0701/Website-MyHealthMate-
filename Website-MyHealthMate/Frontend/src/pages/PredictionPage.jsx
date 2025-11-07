import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { questions } from '../lib/data';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ChevronLeft, ChevronRight, Activity, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export function PredictionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentAnswer = answers.find((a) => a.questionId === questions[currentQuestion].id)?.answer;

  const handleAnswer = (answer) => {
    const newAnswers = answers.filter((a) => a.questionId !== questions[currentQuestion].id);
    newAnswers.push({
      questionId: questions[currentQuestion].id,
      answer,
    });
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!currentAnswer) {
      toast.error('Vui lòng chọn một câu trả lời!');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async () => {
    // TODO: Send answers to the backend and get the prediction result
    // Example:
    // try {
    //   const response = await fetch('/api/predict', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ userId: user?.id, answers }),
    //   });
    //   if (response.ok) {
    //     const predictionResult = await response.json();
    //     // Save to localStorage or state management
    //     const history = JSON.parse(localStorage.getItem('prediction_history') || '[]');
    //     history.unshift(predictionResult);
    //     localStorage.setItem('prediction_history', JSON.stringify(history));
    //
    //     setResult(predictionResult);
    //     toast.success('Dự đoán hoàn tất!');
    //   } else {
    //     toast.error('Không thể thực hiện dự đoán.');
    //   }
    // } catch (error) {
    //   toast.error('Không thể thực hiện dự đoán.');
    // }

    let totalRisk = 0;
    let maxRisk = 0;

    questions.forEach((question) => {
      maxRisk += question.riskWeight;
      const answer = answers.find((a) => a.questionId === question.id);
      if (answer?.answer === 'Có' || answer?.answer === 'Trên 45' || answer?.answer === 'Nam') {
        totalRisk += question.riskWeight;
      }
    });

    const probability = Math.round((totalRisk / maxRisk) * 100);
    let riskLevel;

    if (probability < 30) {
      riskLevel = 'low';
    } else if (probability < 60) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    const predictionResult = {
      id: Date.now().toString(),
      userId: user?.id,
      date: new Date().toISOString(),
      riskLevel,
      probability,
      answers,
    };

    // Save to localStorage
    const history = JSON.parse(localStorage.getItem('prediction_history') || '[]');
    history.unshift(predictionResult);
    localStorage.setItem('prediction_history', JSON.stringify(history));

    setResult(predictionResult);
    toast.success('Dự đoán hoàn tất!');
  };

  const resetPrediction = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    return <ResultView result={result} onReset={resetPrediction} onViewHistory={() => navigate('/history')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-gray-800 text-center mb-2">Đánh giá nguy cơ tiểu đường</h1>
          <p className="text-gray-600 text-center">Trả lời 15 câu hỏi để nhận kết quả đánh giá</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Câu hỏi {currentQuestion + 1}/{questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-8 rounded-2xl shadow-lg mb-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-green-600 mb-3">
              <Activity className="w-5 h-5" />
              <span className="text-sm">Câu hỏi {currentQuestion + 1}</span>
            </div>
            <h2 className="text-gray-800">{questions[currentQuestion].text}</h2>
          </div>

          <RadioGroup value={currentAnswer} onValueChange={handleAnswer}>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option) => (
                <div
                  key={option}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-green-300 ${
                    currentAnswer === option ? 'border-green-600 bg-green-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleAnswer(option)}
                >
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="flex-1 rounded-xl"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <Button onClick={handleNext} className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl">
            {currentQuestion === questions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ResultView({
  result,
  onReset,
  onViewHistory,
}) {
  const riskConfig = {
    low: {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: CheckCircle2,
      label: 'Nguy cơ thấp',
      message: 'Kết quả tốt! Bạn có nguy cơ thấp mắc bệnh tiểu đường.',
      advice: 'Hãy duy trì lối sống lành mạnh, ăn uống cân đối và tập luyện đều đặn.',
    },
    medium: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      icon: AlertCircle,
      label: 'Nguy cơ trung bình',
      message: 'Bạn có nguy cơ trung bình mắc bệnh tiểu đường.',
      advice: 'Nên cải thiện chế độ ăn uống, tăng cường vận động và kiểm tra sức khỏe định kỳ.',
    },
    high: {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      icon: TrendingUp,
      label: 'Nguy cơ cao',
      message: 'Bạn có nguy cơ cao mắc bệnh tiểu đường.',
      advice: 'Khuyến nghị gặp bác sĩ để được tư vấn và xét nghiệm chuyên sâu.',
    },
  };

  const config = riskConfig[result.riskLevel];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-12 h-12 ${config.color}`} />
          </div>
          <h1 className="text-gray-800 mb-2">Kết quả đánh giá</h1>
          <p className="text-gray-600">Dựa trên các câu trả lời của bạn</p>
        </div>

        <Card className="p-8 rounded-2xl shadow-lg mb-6">
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="text-6xl mb-2">{result.probability}%</div>
              <div className={`text-xl ${config.color}`}>{config.label}</div>
            </div>

            {/* Progress Circle Visual */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${(result.probability / 100) * 552.92} 552.92`}
                  className={config.color}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl">{result.probability}%</div>
                  <div className="text-sm text-gray-600">Nguy cơ</div>
                </div>
              </div>
            </div>
          </div>

          <Alert className={`${config.bgColor} ${config.borderColor} border-2 mb-6`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
            <AlertDescription className="text-gray-800">
              <div className="mb-2">{config.message}</div>
              <div className="text-sm">{config.advice}</div>
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700">
            <strong>Lưu ý:</strong> Kết quả này chỉ mang tính chất tham khảo và không thay thế cho chẩn đoán y khoa
            chuyên nghiệp. Vui lòng tham khảo ý kiến bác sĩ để được tư vấn cụ thể.
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={onReset} variant="outline" className="rounded-xl">
            Làm lại
          </Button>
          <Button onClick={onViewHistory} variant="outline" className="rounded-xl">
            Xem lịch sử
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 rounded-xl">Xem bài viết liên quan</Button>
        </div>
      </div>
    </div>
  );
}

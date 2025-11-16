import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { usePrediction } from '../lib/hooks';
import { questions } from '../lib/data';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { ChevronLeft, ChevronRight, Activity, AlertCircle, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PredictionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createPrediction } = usePrediction();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestionData.id)?.answer || '';

  const handleAnswer = (value) => {
    const newAnswers = answers.filter((a) => a.questionId !== currentQuestionData.id);
    newAnswers.push({
      questionId: currentQuestionData.id,
      answer: value,
    });
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!currentAnswer || currentAnswer === '') {
      toast.error('Vui lòng chọn/nhập giá trị!');
      return;
    }

    // Validate number range (chỉ cho câu hỏi số)
    if (currentQuestionData.type === 'number') {
      const value = parseFloat(currentAnswer);
      if (isNaN(value) || value < currentQuestionData.min || value > currentQuestionData.max) {
        toast.error(`Giá trị phải từ ${currentQuestionData.min} đến ${currentQuestionData.max}`);
        return;
      }
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
    setIsLoading(true);

    try {
      // Convert answers to input data format for backend
      const inputData = {};
      const symptomScores = {};

      answers.forEach(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        if (question) {
          // Parse based on step (if step is decimal, use float, else use int)
          const value = question.step && question.step < 1
            ? parseFloat(answer.answer)
            : parseInt(answer.answer);

          // Phân loại: chỉ số y tế vs triệu chứng
          if (answer.questionId.startsWith('symptom_')) {
            symptomScores[answer.questionId] = value;
          } else {
            inputData[answer.questionId] = value;
          }
        }
      });

      // Validate all required medical fields (8 chỉ số y tế)
      const requiredFields = ['age', 'pregnancies', 'glucose', 'bloodPressure', 'skinThickness', 'insulin', 'bmi', 'diabetesPedigreeFunction'];
      const missingFields = requiredFields.filter(field => inputData[field] === undefined);

      if (missingFields.length > 0) {
        toast.error(`Thiếu thông tin: ${missingFields.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Call API to create prediction
      const predictionData = {
        ...inputData,
        // Patient info được xử lý riêng trong service
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim() || undefined
      };

      console.log('📊 Sending prediction data:', predictionData);

      const savedPrediction = await createPrediction(predictionData);

      setResult(savedPrediction);
      toast.success('Dự đoán hoàn tất!');
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error(error.message || 'Không thể thực hiện dự đoán. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPrediction = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    setPatientName('');
    setPatientEmail('');
    setShowPatientForm(false);
    setShowIntro(true);
  };

  const handleStartPrediction = () => {
    if (!patientName.trim()) {
      toast.error('Vui lòng nhập tên bệnh nhân');
      return;
    }
    if (patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
      toast.error('Email không hợp lệ');
      return;
    }
    setShowPatientForm(false);
    setShowIntro(false);
  };

  if (result) {
    return <ResultView result={result} onReset={resetPrediction} onViewHistory={() => navigate('/history')} />;
  }

  // Introduction Page
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-6">
              <Activity className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-gray-800 mb-4">Đánh giá nguy cơ tiểu đường</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Công cụ đánh giá nguy cơ mắc bệnh tiểu đường dựa trên các chỉ số y tế và triệu chứng của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 rounded-2xl shadow-lg text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Chính xác</h3>
              <p className="text-sm text-gray-600">Sử dụng AI và dữ liệu y tế để đưa ra kết quả đánh giá</p>
            </Card>

            <Card className="p-6 rounded-2xl shadow-lg text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Nhanh chóng</h3>
              <p className="text-sm text-gray-600">Chỉ mất 5-10 phút để hoàn thành bài đánh giá</p>
            </Card>

            <Card className="p-6 rounded-2xl shadow-lg text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Theo dõi</h3>
              <p className="text-sm text-gray-600">Lưu lại lịch sử và theo dõi sự thay đổi theo thời gian</p>
            </Card>
          </div>

          <Card className="p-8 rounded-2xl shadow-lg mb-8 items-center">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Quy trình đánh giá</h2>

            <div className="space-y-4 w-full">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 aspect-square rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Nhập thông tin bệnh nhân</h3>
                  <p className="text-gray-600 text-sm">Cung cấp tên và email của bệnh nhân cần đánh giá</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 aspect-square rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Trả lời 21 câu hỏi</h3>
                  <p className="text-gray-600 text-sm">Nhập các chỉ số y tế và triệu chứng theo hướng dẫn</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 aspect-square rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Nhận kết quả đánh giá</h3>
                  <p className="text-gray-600 text-sm">Xem mức độ nguy cơ và khuyến nghị từ hệ thống</p>
                </div>
              </div>
            </div>
          </Card>


          <Alert className="bg-blue-50 border-blue-200 mb-8">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-gray-700">
              <strong>Lưu ý:</strong> Kết quả đánh giá chỉ mang tính chất tham khảo và không thay thế cho chẩn đoán y khoa.
              Vui lòng tham khảo ý kiến bác sĩ để được tư vấn cụ thể.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button
              onClick={() => {
                setShowIntro(false);
                setShowPatientForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 rounded-xl text-lg px-12 py-6"
              size="lg"
            >
              Bắt đầu dự đoán mới
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Patient Information Form
  if (showPatientForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-gray-800 text-center mb-2">Thông tin bệnh nhân</h1>
            <p className="text-gray-600 text-center">Vui lòng nhập thông tin bệnh nhân trước khi bắt đầu đánh giá</p>
          </div>

          <Card className="p-8 rounded-2xl shadow-lg">
            <div className="space-y-6">
              <div>
                <Label htmlFor="patientName" className="text-gray-700 mb-2 block">
                  Họ và tên bệnh nhân <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="patientName"
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nhập họ tên đầy đủ"
                  className="text-lg p-6 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="patientEmail" className="text-gray-700 mb-2 block">
                  Email bệnh nhân (không bắt buộc)
                </Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="text-lg p-6 rounded-xl"
                />
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-gray-700">
                  Thông tin bệnh nhân sẽ được lưu cùng với kết quả dự đoán để tiện theo dõi.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleStartPrediction}
                className="w-full bg-green-600 hover:bg-green-700 rounded-xl text-lg py-6"
              >
                Bắt đầu đánh giá
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-gray-800 text-center mb-2">Đánh giá nguy cơ tiểu đường</h1>
          <p className="text-gray-600 text-center">Trả lời 21 câu hỏi để nhận kết quả đánh giá chính xác</p>
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-green-600">
                <Activity className="w-5 h-5" />
                <span className="text-sm">Câu hỏi {currentQuestion + 1}</span>
              </div>
              {currentQuestionData.tooltip && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTooltip(true)}
                  className="gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Hướng dẫn đo
                </Button>
              )}
            </div>
            <h2 className="text-gray-800 mb-2">{currentQuestionData.text}</h2>
            {currentQuestionData.hint && (
              <p className="text-sm text-gray-500 italic">{currentQuestionData.hint}</p>
            )}
          </div>

          <div className="space-y-4">
            {currentQuestionData.type === 'select' ? (
              // Select dropdown cho câu hỏi triệu chứng
              <div>
                <Label htmlFor="answer" className="text-gray-700 mb-2 block">
                  Chọn đáp án
                </Label>
                <Select value={currentAnswer} onValueChange={handleAnswer}>
                  <SelectTrigger className="text-lg p-6 rounded-xl">
                    <SelectValue placeholder={currentQuestionData.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestionData.options.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              // Input number cho câu hỏi chỉ số y tế
              <div>
                <Label htmlFor="answer" className="text-gray-700 mb-2 block">
                  Nhập giá trị {currentQuestionData.unit && `(${currentQuestionData.unit})`}
                </Label>
                <Input
                  id="answer"
                  type="number"
                  value={currentAnswer}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={currentQuestionData.placeholder}
                  min={currentQuestionData.min}
                  max={currentQuestionData.max}
                  step={currentQuestionData.step || 1}
                  className="text-lg p-6 rounded-xl"
                  disabled={isLoading}
                />
              </div>
            )}

            {currentQuestionData.type !== 'select' && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Giá trị hợp lệ:</span>
                <span className="font-medium text-gray-700">
                  {currentQuestionData.min} - {currentQuestionData.max} {currentQuestionData.unit}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0 || isLoading}
            className="flex-1 rounded-xl"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              'Đang xử lý...'
            ) : (
              <>
                {currentQuestion === questions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Tooltip Dialog - Always render for Portal to work */}
        <Dialog open={showTooltip} onOpenChange={setShowTooltip}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentQuestionData?.tooltip?.title || 'Hướng dẫn đo'}
              </DialogTitle>
              <DialogDescription>
                Hướng dẫn cách đo và các công cụ cần thiết
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              {currentQuestionData?.tooltip?.items?.map((item, idx) => (
                <div key={idx} className={item === '' ? 'h-2' : ''}>
                  {item}
                </div>
              )) || <p>Không có hướng dẫn</p>}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ResultView({
  result,
  onReset,
  onViewHistory,
}) {
  // Calculate risk level from probability and round to integer
  const probability = Math.round(result.probability || 0);
  let riskLevel = 'low';
  if (probability >= 70) riskLevel = 'high';
  else if (probability >= 30) riskLevel = 'medium';

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

  const config = riskConfig[riskLevel];
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
              <div className="text-6xl mb-2">{probability}%</div>
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
                  strokeDasharray={`${(probability / 100) * 552.92} 552.92`}
                  className={config.color}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl">{probability}%</div>
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

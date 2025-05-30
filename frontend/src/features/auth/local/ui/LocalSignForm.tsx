import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { ItemField } from "@/shared/ui/ItemField";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface LocalSignFormProps {
  mode: "signin" | "signup";
  onSubmit: (data: {
    email: string;
    password: string;
    nickname?: string;
  }) => void;
}

export const LocalSignForm = ({ mode, onSubmit }: LocalSignFormProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const slug = searchParams.get("slug");
  const shareKey = searchParams.get("shareKey");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  // 에러 메시지 상태
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  // 각 필드가 터치되었는지 여부 (blur 되었는지)
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [nicknameTouched, setNicknameTouched] = useState(false);

  const [isFormValid, setIsFormValid] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 개별 필드 검증 함수
  const validateEmail = () => {
    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      return false;
    } else if (password.length < 2) {
      setPasswordError("비밀번호는 최소 2자 이상이어야 합니다.");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateNickname = () => {
    if (mode === "signup") {
      if (!nickname) {
        setNicknameError("닉네임을 입력해주세요.");
        return false;
      } else {
        setNicknameError("");
        return true;
      }
    } else {
      setNicknameError("");
      return true;
    }
  };

  // 전체 폼 유효성 검사
  const validateForm = () => {
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    const nicknameValid = validateNickname();

    setIsFormValid(emailValid && passwordValid && nicknameValid);
  };

  // 입력값이 바뀔 때마다 전체 폼 유효성 검사 (에러 메시지는 터치된 필드에만 표시)
  useEffect(() => {
    validateForm();
  }, [email, password, nickname, mode]);

  // 각 필드가 터치될 때만 에러 메시지 보이도록 처리
  useEffect(() => {
    if (emailTouched) validateEmail();
  }, [email, emailTouched]);

  useEffect(() => {
    if (passwordTouched) validatePassword();
  }, [password, passwordTouched]);

  useEffect(() => {
    if (nicknameTouched) validateNickname();
  }, [nickname, nicknameTouched, mode]);

  const handleSubmit = () => {
    // 제출 시에는 모든 필드를 터치한 상태로 만들고 전체 검증
    setEmailTouched(true);
    setPasswordTouched(true);
    setNicknameTouched(true);

    validateForm();

    if (!isFormValid) return;

    if (mode === "signin") {
      onSubmit({ email, password });
    } else {
      onSubmit({ email, password, nickname });
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="max-h-full overflow-y-auto scroll-custom bg-neutral100/15 b-blur flex flex-col gap-8 px-12 py-14 m-4 mb-8 border border-neutral100/70 rounded-xl">
        <div className="text-2xl font-bold">
          {mode === "signin" ? "로그인" : "회원가입"}
        </div>
        <div className="flex flex-col gap-2">
          <ItemField icon="email" fill title="아이디(이메일)" required>
            <Input
              type="email"
              value={email}
              onChange={setEmail}
              onBlur={() => setEmailTouched(true)}
              placeholder="이메일을 입력하세요"
              maxLength={50}
              showCount={true}
            />
            {emailTouched && emailError && (
              <div className="font-light text-left p-1 text-sm text-warning mt-1">
                {emailError}
              </div>
            )}
          </ItemField>

          <ItemField icon="password" title="비밀번호" required>
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              onBlur={() => setPasswordTouched(true)}
              placeholder="비밀번호를 입력하세요"
              maxLength={50}
              showCount={true}
            />
            {passwordTouched && passwordError && (
              <div className="font-light text-left p-1 text-sm text-warning mt-1">
                {passwordError}
              </div>
            )}
          </ItemField>
          {mode === "signup" && (
            <>
              <ItemField icon="badge" fill title="닉네임" required>
                <Input
                  value={nickname}
                  onChange={setNickname}
                  onBlur={() => setNicknameTouched(true)}
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                  showCount={true}
                />
                {nicknameTouched && nicknameError && (
                  <div className="font-light text-left p-1 text-sm text-warning mt-1">
                    {nicknameError}
                  </div>
                )}
              </ItemField>
            </>
          )}
        </div>
        <Button
          color="green"
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="w-full"
        >
          {mode === "signin" ? "로그인" : "회원가입"}
        </Button>
        <div className="text-sm flex flex-wrap gap-2 justify-center">
          <div className="text-neutral600">
            {mode === "signin"
              ? "아직 회원이 아니신가요?"
              : "이미 회원이신가요?"}
          </div>
          <div
            className="text-neutral500 font-bold cursor-pointer"
            onClick={() => {
              if (mode === "signin") {
                navigate(
                  `/signup${
                    slug && shareKey
                      ? `?slug=${slug ?? ""}&shareKey=${shareKey ?? ""}`
                      : ""
                  }`
                );
              } else {
                navigate(
                  `/signin${
                    slug && shareKey
                      ? `?slug=${slug ?? ""}&shareKey=${shareKey ?? ""}`
                      : ""
                  }`
                );
              }
            }}
          >
            {mode === "signin" ? "회원가입" : "로그인"}
          </div>
        </div>
      </div>
    </div>
  );
};

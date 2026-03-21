import Button from "@/core/components/normal/Button"
import { ArrowRight, Plus, Sun, Trash, Upload } from "lucide-react"

type Props = {}

const sizes = [
  {
    title: "Small",
    size: "sm",
  },
  {
    title: "Medium",
    size: "md",
  },
  {
    title: "Large",
    size: "lg",
  },
]

const withIcons = [
  {
    title: "New File",
    leftIcon: <Plus size={16} />,
  },
  {
    title: "Continue",
    rightIcon: <ArrowRight size={16} />,
  },
  {
    title: "Export",
    rightIcon: <ArrowRight size={16} />,
    variant: "ghost",
    leftIcon: <Upload size={16} />,
  },
  {
    title: "Delete",
    leftIcon: <Trash size={16} />,
    variant: "danger",
  },
]

const iconOnly = [
  {
    item: <Plus size={16} />,
    size: "sm",
  },
  {
    item: <Plus size={16} />,
    size: "md",
  },
  {
    item: <Plus size={16} />,
    size: "lg",
  },
  {
    item: <Sun size={16} />,
    size: "md",
    variant: "secondary",
  },
  {
    item: <Trash size={16} />,
    size: "md",
    variant: "danger",
  },
]

export default function Buttonshowcase({}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase text-[#0F0F0F]/80 mb-3">Size</p>
        <div className="flex items-center gap-2">
          {sizes.map((item) => (
            <Button size={item?.size as any}>{item?.title}</Button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase text-[#0F0F0F]/80 mb-3">With Icons</p>
        <div className="flex items-center gap-2">
          {withIcons.map((item) => (
            <Button
              rightIcon={item?.rightIcon}
              leftIcon={item?.leftIcon}
              variant={item?.variant as any}
            >
              {item?.title}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase text-[#0F0F0F]/80 mb-3">Icons Only</p>
        <div className="flex items-center gap-2">
          {iconOnly.map((item) => (
            <Button iconOnly size={item?.size as any} variant={item?.variant}>
              {item?.item}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase text-[#0F0F0F]/80 mb-3">Loading State</p>
        <div className="flex items-center gap-2">
          <Button isLoading>Loading</Button>
          <Button isLoading loadingText="Please wait...">
            Loading
          </Button>
          <Button isLoading loadingText="Syncing">
            Loading
          </Button>
          <Button isLoading iconOnly>
            Loading
          </Button>
        </div>
      </div>
    </div>
  )
}

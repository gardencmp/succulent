import { Post } from '@/sharedDataModel';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toDateTimeLocal } from '@/lib/dates';

// postState: 'scheduleDesired' | 'scheduled' | 'notScheduled' | 'posted'

export function DraftPostScheduler({
  post,
  desiredScheduleDate,
  setDesiredScheduleDate,
  unschedulePost,
  schedulePost,
}: {
  post: Post;
  desiredScheduleDate: Date | undefined;
  setDesiredScheduleDate: React.Dispatch<
    React.SetStateAction<Date | undefined>
  >;
  unschedulePost: () => void;
  schedulePost: (date: Date) => void;
}) {
  if (!post) return;

  return (
    <>
      <Input
        type="datetime-local"
        value={
          post.instagram.state === 'scheduleDesired' ||
          post.instagram.state === 'scheduled'
            ? toDateTimeLocal(post.instagram.scheduledAt)
            : desiredScheduleDate &&
              toDateTimeLocal(desiredScheduleDate.toISOString())
        }
        onChange={(event) => {
          setDesiredScheduleDate(new Date(event.target.value));
        }}
        min={toDateTimeLocal(new Date().toISOString())}
        className="dark:[color-scheme:dark] max-w-[13rem]"
      />
      <div className="whitespace-nowrap mr-auto">
        {post.instagram.state === 'notScheduled' ? (
          desiredScheduleDate ? (
            <Button
              onClick={() => {
                if (!desiredScheduleDate) return;
                console.log(
                  'Scheduling for ' + desiredScheduleDate.toISOString()
                );
                schedulePost(desiredScheduleDate);
              }}
            >
              Schedule
            </Button>
          ) : (
            'Not yet scheduled'
          )
        ) : post.instagram.state === 'scheduleDesired' ? (
          'Schedule desired' +
          (post.instagram.notScheduledReason
            ? ' (⚠️ ' + post.instagram.notScheduledReason + ')'
            : ' (✈️ offline)')
        ) : post.instagram.state === 'scheduled' ? (
          'Scheduled'
        ) : post.instagram.state === 'posted' ? (
          'Posted'
        ) : (
          'loading'
        )}
      </div>
      {(post.instagram.state === 'scheduleDesired' ||
        post.instagram.state === 'scheduled') && (
        <Button variant="outline" onClick={unschedulePost}>
          Unschedule
        </Button>
      )}
    </>
  );
}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.models import Task, Job
from .auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/")
def get_tasks(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Fetch tasks for all jobs owned by the user
    owned_job_ids = [j.id for j in current_user.jobs_owned]
    tasks = db.query(Task).filter(Task.job_id.in_(owned_job_ids)).all()
    return tasks

@router.post("/")
def create_task(task_data: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Verify job ownership
    job = db.query(Job).filter(Job.id == task_data["jobId"], Job.studio_owner_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=403, detail="Not authorized to add tasks to this job")
    
    new_task = Task(
        job_id=task_data["jobId"],
        text=task_data["text"],
        completed=False
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/{task_id}")
def update_task(task_id: int, update_data: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Verify ownership through the job
    if task.job.studio_owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if "text" in update_data:
        task.text = update_data["text"]
    if "completed" in update_data:
        task.completed = update_data["completed"]
        
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.job.studio_owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db.delete(task)
    db.commit()
    return {"status": "deleted"}
